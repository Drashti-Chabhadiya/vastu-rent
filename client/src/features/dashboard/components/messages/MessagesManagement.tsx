import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquare,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'
import type {
  Conversation,
  Message as BaseMessage,
} from '../../../../hook/use-chat'
import { cn } from '#/lib/utils'
import { apiClient } from '#/lib/api'
import { useChat } from '#/hook'

import { NewChatDialog } from './components/NewChatDialog'
import { ConversationList } from './components/ConversationList'
import { ChatWindow } from './components/ChatWindow'

type Message = BaseMessage

// ─── Reply Helpers ────────────────────────────────────────────────────────────
const REPLY_SEP = '\u200B\u{1F4AC}\u200B' // zero-width + speech bubble + zero-width (invisible separator)

function buildReplyContent(replyText: string, mainText: string) {
  const truncated =
    replyText.length > 120 ? replyText.slice(0, 120) + '…' : replyText
  return `>>REPLY_TO::${truncated}${REPLY_SEP}${mainText}`
}

function parseMessage(content: string): {
  replyQuote: string | null
  text: string
} {
  if (content.startsWith('>>REPLY_TO::')) {
    const withoutPrefix = content.slice('>>REPLY_TO::'.length)
    const sepIdx = withoutPrefix.indexOf(REPLY_SEP)
    if (sepIdx !== -1) {
      return {
        replyQuote: withoutPrefix.slice(0, sepIdx),
        text: withoutPrefix.slice(sepIdx + REPLY_SEP.length),
      }
    }
  }
  return { replyQuote: null, text: content }
}

interface ReplyTarget {
  id: string
  content: string
  senderName: string
  isMe: boolean
}

export const MessagesManagement = () => {
  const {
    isConnected,
    conversations,
    isLoadingConversations,
    activeConversationId,
    switchConversation,
    messages,
    isLoadingMessages,
    sendMessage,
    emitTyping,
    isOtherPersonTyping,
    checkOnline,
    currentUserId,
  } = useChat()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'unread' | 'bookings' | 'support'
  >('all')
  const [inputText, setInputText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)

  // Attachment state
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string | null>(null)

  // ── Keyboard: ESC closes lightbox ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!showLightbox) return
      if (e.key === 'Escape') setShowLightbox(false)
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i + 1) % lightboxImages.length)
      if (e.key === 'ArrowLeft')
        setLightboxIndex(
          (i) => (i - 1 + lightboxImages.length) % lightboxImages.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLightbox, lightboxImages.length])

  const openLightbox = (images: string[], startIndex: number) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
    setShowLightbox(true)
  }

  // ── New Message Dialog state ──────────────────────────────────────────────
  const [showNewChat, setShowNewChat] = useState(false)

  // Auto-scroll to bottom when messages change or conversation switches
  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) {
      const isSameConv = prevConversationIdRef.current === activeConversationId
      el.scrollTo({
        top: el.scrollHeight,
        behavior: isSameConv ? 'smooth' : 'auto',
      })
    }
    prevConversationIdRef.current = activeConversationId
  }, [messages, isOtherPersonTyping, activeConversationId])

  // Find the active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

  // ── Filter conversations ─────────────────────────────────────────────────
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.otherParticipant.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conv.lastMessage?.content || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    let matchesTab = true
    if (activeSubTab === 'unread') matchesTab = conv.unreadCount > 0
    else if (activeSubTab === 'bookings')
      matchesTab = conv.otherParticipant.role === 'owner'
    else if (activeSubTab === 'support')
      matchesTab =
        conv.otherParticipant.role === 'admin' ||
        conv.otherParticipant.role === 'superAdmin'

    return matchesSearch && matchesTab
  })

  // Total unread across all conversations
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // ── Handle typing indicator ──────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    emitTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000)
  }

  // ── Handle send ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const hasText = inputText.trim().length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasText && !hasFiles) return
    if (!activeConversationId) {
      toast.error('Please select a conversation first')
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload any pending file attachments
      let uploadedUrls: string[] = []
      if (hasFiles) {
        const uploads = await Promise.all(
          pendingFiles.map(async (file) => {
            const formData = new FormData()
            formData.append('file', file)
            const res = await apiClient.post('/chat/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
            return res.data.url as string
          }),
        )
        uploadedUrls = uploads
      }

      // 2. Build final message content
      const finalContent = replyTarget
        ? buildReplyContent(replyTarget.content, inputText.trim())
        : inputText.trim()

      // 3. Send via socket
      sendMessage(finalContent, uploadedUrls)

      // 4. Reset state
      setInputText('')
      setReplyTarget(null)
      setPendingFiles([])
      setPendingPreviews([])
      emitTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload attachment')
    } finally {
      setIsUploading(false)
    }
  }

  // ── Handle file selection ─────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Limit to 5 images
    const allowed = files.slice(0, 5 - pendingFiles.length)
    const newPreviews = allowed.map((f) => URL.createObjectURL(f))
    setPendingFiles((prev) => [...prev, ...allowed])
    setPendingPreviews((prev) => [...prev, ...newPreviews])
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index])
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Handle reply ─────────────────────────────────────────────────────────
  const handleReply = useCallback(
    (msg: Message, isMe: boolean) => {
      const { text } = parseMessage(msg.content)
      const senderName = isMe
        ? 'You'
        : (activeConversation?.otherParticipant.name ?? 'Them')
      setReplyTarget({ id: msg.id, content: text, senderName, isMe })
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    [activeConversation],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Handle conversation select ───────────────────────────────────────────
  const handleSelectConversation = (conv: Conversation) => {
    switchConversation(conv.id)
    setShowMobileChat(true)
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div
          className={cn(
            'flex',
            'flex-col',
            'sm:flex-row',
            'sm:items-center',
            'justify-between',
            'gap-4',
          )}
        >
          <div className={cn('flex', 'items-center', 'gap-3')}>
            <div
              className={cn(
                'w-10',
                'h-10',
                'rounded-xl',
                'bg-primary/10',
                'flex',
                'items-center',
                'justify-center',
                'text-primary',
                'shrink-0',
              )}
            >
              <MessageSquare size={20} fill="currentColor" />
            </div>
            <div>
              <div className={cn('flex', 'items-center', 'gap-2')}>
                <h1 className={cn('text-xl', 'font-black', 'text-foreground')}>
                  Messages
                </h1>
                {/* Socket connection badge */}
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black',
                    isConnected
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-muted/50 text-muted-dark',
                  )}
                >
                  {isConnected ? (
                    <>
                      <Wifi size={8} strokeWidth={3} /> Live
                    </>
                  ) : (
                    <>
                      <WifiOff size={8} strokeWidth={3} /> Connecting...
                    </>
                  )}
                </div>
              </div>
              <p
                className={cn(
                  'text-[11px]',
                  'text-muted-foreground/70',
                  'font-bold',
                  'leading-normal',
                )}
              >
                Chat with hosts, buyers and our support team.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowNewChat(true)}
            className={cn(
              'border-primary',
              'text-primary',
              'hover:bg-primary-soft',
              'rounded-xl',
              'text-xs',
              'font-bold',
              'flex',
              'items-center',
              'gap-2',
              'h-9',
              'px-4',
              'self-start',
              'sm:self-auto',
              'cursor-pointer',
              'shadow-none',
            )}
          >
            <PenSquare size={14} strokeWidth={2.5} />
            New Message
          </Button>
        </div>

        {/* ── New Message Dialog ── */}
        <NewChatDialog
          open={showNewChat}
          onOpenChange={setShowNewChat}
          switchConversation={switchConversation}
          setShowMobileChat={setShowMobileChat}
        />

        {/* Dual Panel */}
        <div
          className={cn(
            'flex',
            'flex-col',
            'lg:flex-row',
            'gap-5',
            'h-[720px]',
            'max-h-[calc(100vh-220px)]',
          )}
        >
          {/* ── LEFT COLUMN: Conversations List ── */}
          <ConversationList
            conversations={conversations}
            filteredConversations={filteredConversations}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            isLoadingConversations={isLoadingConversations}
            currentUserId={currentUserId}
            totalUnread={totalUnread}
            showMobileChat={showMobileChat}
          />

          {/* ── RIGHT COLUMN: Active Chat ── */}
          <ChatWindow
            activeConversation={activeConversation}
            showMobileChat={showMobileChat}
            setShowMobileChat={setShowMobileChat}
            checkOnline={checkOnline}
            isOtherPersonTyping={isOtherPersonTyping}
            isLoadingMessages={isLoadingMessages}
            messages={messages}
            currentUserId={currentUserId}
            hoveredMsgId={hoveredMsgId}
            setHoveredMsgId={setHoveredMsgId}
            openLightbox={openLightbox}
            handleReply={handleReply}
            replyTarget={replyTarget}
            setReplyTarget={setReplyTarget}
            pendingPreviews={pendingPreviews}
            pendingFiles={pendingFiles}
            removeFile={removeFile}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            isConnected={isConnected}
            inputText={inputText}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            setInputText={setInputText}
            handleSend={handleSend}
            isUploading={isUploading}
            messagesContainerRef={messagesContainerRef}
            inputRef={inputRef}
            onCallSuccess={(name) => toast.success(`Calling ${name}...`)}
            onVideoSuccess={(name) => toast.success(`Starting video call with ${name}...`)}
            onMoreInfo={() => toast.info('Conversation options coming soon')}
          />
        </div>
      </div>

      {/* ── Image Lightbox Modal ── */}
      {showLightbox && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </Button>

          {/* Image counter */}
          {lightboxImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-black tracking-wider">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}

          {/* Prev button */}
          {lightboxImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(
                  (i) =>
                    (i - 1 + lightboxImages.length) % lightboxImages.length,
                )
              }}
              className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </Button>
          )}

          {/* Next button */}
          {lightboxImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i + 1) % lightboxImages.length)
              }}
              className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </Button>
          )}

          {/* Main image */}
          <div
            className="relative z-10 max-w-[90vw] max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxImages[lightboxIndex]}
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-200"
            />
          </div>

          {/* Thumbnail strip (if multiple images) */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {lightboxImages.map((src, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(i)
                  }}
                  className={cn(
                    'w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer p-0 hover:bg-transparent',
                    i === lightboxIndex
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-white/30 opacity-60 hover:opacity-90',
                  )}
                >
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
