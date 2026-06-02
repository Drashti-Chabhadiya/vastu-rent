import { useState, useEffect, useRef, useCallback } from 'react'
import EmojiPicker from 'emoji-picker-react'
import {
  MessageSquare,
  Search,
  SlidersHorizontal,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Check,
  PenSquare,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Wifi,
  WifiOff,
  UserPlus,
  Reply,
  X,
  CornerUpLeft,
  ImagePlus,
  ZoomIn,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { toast } from 'sonner'
import type {
  Conversation,
  Message as BaseMessage,
} from '../../../../hook/use-chat'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { apiClient } from '#/lib/api'
import { useChat } from '#/hook'

// Message type comes fully from use-chat (includes attachments: string[])
type Message = BaseMessage

// ─── Reply Helpers ────────────────────────────────────────────────────────────
const REPLY_SEP = '\u200B\u{1F4AC}\u200B' // zero-width + speech bubble + zero-width (invisible separator)

function buildReplyContent(replyText: string, mainText: string) {
  // Format: >>REPLY_TO::<truncated reply text>\n<main message>
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

type ReplyTarget = {
  id: string
  content: string
  senderName: string
  isMe: boolean
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) return format(date, 'h:mm a')
  if (diffHrs < 48) return 'Yesterday'
  return format(date, 'dd MMM')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function UserAvatar({
  image,
  name,
  isOnline,
  size = 'md',
}: {
  image: string | null
  name: string
  isOnline?: boolean
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-11 h-11 text-xs'
  const dotSize =
    size === 'sm' ? 'w-2.5 h-2.5 border-[2px]' : 'w-3 h-3 border-[2.5px]'
  const radius = size === 'sm' ? 'rounded-lg' : 'rounded-xl'

  return (
    <div className={cn('relative', 'shrink-0')}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={cn(dim, radius, 'object-cover')}
        />
      ) : (
        <div
          className={cn(
            dim,
            radius,
            'bg-primary/10 flex items-center justify-center font-black text-primary',
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <div
          className={cn(
            dotSize,
            'absolute -bottom-0.5 -right-0.5 rounded-full border-card',
            isOnline ? 'bg-emerald-500' : 'bg-muted-dark/20',
          )}
        />
      )}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className={cn('flex', 'gap-3', 'max-w-[70%]', 'mr-auto')}>
      <div
        className={cn(
          'p-3.5',
          'rounded-2xl',
          'rounded-tl-none',
          'bg-card',
          'border',
          'border-border/30',
          'shadow-sm',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-1.5', 'h-4')}>
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:0ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:150ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:300ms]',
            )}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      className={cn(
        'flex-1',
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'text-center',
        'px-8',
      )}
    >
      <div
        className={cn(
          'w-16',
          'h-16',
          'rounded-2xl',
          'bg-primary/10',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <MessageSquare size={28} className="text-primary" fill="currentColor" />
      </div>
      <div>
        <h3 className={cn('text-[13px]', 'font-black', 'text-foreground')}>
          Select a conversation
        </h3>
        <p
          className={cn(
            'text-[11px]',
            'text-muted-dark',
            'font-bold',
            'mt-1',
            'leading-relaxed',
          )}
        >
          Choose a chat from the list or start a new one.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null)
  const userSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced user search
  useEffect(() => {
    if (!showNewChat) return
    if (userSearchTimerRef.current) clearTimeout(userSearchTimerRef.current)
    setIsSearchingUsers(true)
    userSearchTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.get('/chat/users/search', {
          params: { q: userSearch || undefined },
        })
        setUserResults(res.data)
      } catch {
        setUserResults([])
      } finally {
        setIsSearchingUsers(false)
      }
    }, 300)
  }, [userSearch, showNewChat])

  const handleStartChat = async (targetUserId: string, targetName: string) => {
    setStartingChatWith(targetUserId)
    try {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      setShowNewChat(false)
      setUserSearch('')
      await switchConversation(res.data.id)
      setShowMobileChat(true)
      toast.success(`Chat opened with ${targetName}!`)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Could not start conversation.',
      )
    } finally {
      setStartingChatWith(null)
    }
  }

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

  // ── Group messages by date ───────────────────────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>(
    (groups, msg) => {
      const dateKey = format(new Date(msg.createdAt), 'dd MMM yyyy')
      const last = groups[groups.length - 1]
      if (last && last.date === dateKey) {
        last.msgs.push(msg)
      } else {
        groups.push({ date: dateKey, msgs: [msg] })
      }
      return groups
    },
    [],
  )

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
        <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
          <DialogContent
            className={cn(
              'max-w-md',
              'rounded-3xl',
              'p-0',
              'overflow-hidden',
              'border-border/30',
              'shadow-2xl',
            )}
          >
            <DialogHeader
              className={cn(
                'px-6',
                'pt-6',
                'pb-4',
                'border-b',
                'border-border/30',
              )}
            >
              <DialogTitle
                className={cn(
                  'text-[15px]',
                  'font-black',
                  'text-foreground',
                  'flex',
                  'items-center',
                  'gap-2',
                )}
              >
                <UserPlus size={18} className="text-primary" />
                Start New Conversation
              </DialogTitle>
            </DialogHeader>

            {/* Search bar */}
            <div className={cn('px-4', 'pt-4')}>
              <div className="relative">
                <Search
                  size={13}
                  className={cn(
                    'absolute',
                    'left-3',
                    'top-[13px]',
                    'text-muted-dark',
                  )}
                />
                <Input
                  autoFocus
                  placeholder="Search by name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={cn(
                    'h-10',
                    'pl-9',
                    'bg-muted-light',
                    'border-none',
                    'rounded-xl',
                    'text-[11px]',
                    'font-bold',
                    'focus-visible:ring-1',
                    'focus-visible:ring-primary/20',
                  )}
                />
              </div>
            </div>

            {/* Results list */}
            <div
              className={cn(
                'px-4',
                'pb-4',
                'mt-2',
                'max-h-72',
                'overflow-y-auto',
                'space-y-1',
                'scrollbar-thin',
              )}
            >
              {isSearchingUsers ? (
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-center',
                    'py-8',
                  )}
                >
                  <Loader2
                    size={18}
                    className={cn('animate-spin', 'text-primary')}
                  />
                </div>
              ) : userResults.length === 0 ? (
                <div
                  className={cn(
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'py-8',
                    'gap-2',
                  )}
                >
                  <MessageSquare
                    size={24}
                    className="text-muted-foreground/30"
                  />
                  <p
                    className={cn(
                      'text-[11px]',
                      'font-bold',
                      'text-muted-dark',
                    )}
                  >
                    {userSearch
                      ? 'No users found'
                      : 'Start typing to search users'}
                  </p>
                </div>
              ) : (
                userResults.map((u) => (
                  <Button
                    key={u.id}
                    variant="ghost"
                    onClick={() => handleStartChat(u.id, u.name)}
                    disabled={startingChatWith === u.id}
                    className={cn(
                      'w-full',
                      'flex',
                      'items-center',
                      'gap-3',
                      'p-3',
                      'rounded-2xl',
                      'hover:bg-muted-light',
                      'transition-colors',
                      'cursor-pointer',
                      'justify-start',
                      'h-auto',
                      'disabled:opacity-60',
                    )}
                  >
                    <UserAvatar
                      image={u.image}
                      name={u.name}
                      isOnline={u.isOnline}
                      size="sm"
                    />
                    <div className={cn('flex-1', 'min-w-0', 'text-left')}>
                      <p
                        className={cn(
                          'text-[12px]',
                          'font-black',
                          'text-foreground',
                          'truncate',
                        )}
                      >
                        {u.name}
                      </p>
                      <p
                        className={cn(
                          'text-[9px]',
                          'font-bold',
                          'text-muted-dark',
                          'capitalize',
                        )}
                      >
                        {u.role}
                      </p>
                    </div>
                    {startingChatWith === u.id ? (
                      <Loader2
                        size={14}
                        className={cn(
                          'animate-spin',
                          'text-primary',
                          'shrink-0',
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          'text-[9px]',
                          'font-black',
                          'text-primary',
                          'bg-primary-soft',
                          'px-2',
                          'py-1',
                          'rounded-lg',
                          'shrink-0',
                        )}
                      >
                        Chat
                      </span>
                    )}
                  </Button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

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
          <div
            className={cn(
              'w-full lg:w-[380px] shrink-0 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
              showMobileChat ? 'hidden lg:flex' : 'flex',
            )}
          >
            {/* Search + Filter */}
            <div className={cn('p-5', 'pb-0', 'shrink-0')}>
              <div className={cn('flex', 'items-center', 'gap-2', 'mb-4')}>
                <div className={cn('relative', 'flex-1')}>
                  <Search
                    size={13}
                    className={cn(
                      'absolute',
                      'left-3',
                      'top-[13px]',
                      'text-muted-dark',
                    )}
                  />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'h-10',
                      'pl-9',
                      'pr-4',
                      'bg-muted-light',
                      'border-none',
                      'rounded-xl',
                      'text-[11px]',
                      'font-bold',
                      'focus-visible:ring-1',
                      'focus-visible:ring-primary/20',
                    )}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-10',
                    'h-10',
                    'bg-muted-light',
                    'hover:bg-muted/50',
                    'rounded-xl',
                    'text-muted-foreground/85',
                    'transition-colors',
                    'cursor-pointer',
                    'shrink-0',
                  )}
                >
                  <SlidersHorizontal size={14} />
                </Button>
              </div>

              {/* Subtabs */}
              <div
                className={cn(
                  'flex',
                  'gap-5',
                  'border-b',
                  'border-border/30',
                  'overflow-x-auto',
                  'scrollbar-none',
                )}
              >
                {(['all', 'unread', 'bookings', 'support'] as const).map(
                  (tab) => {
                    const tabUnread =
                      tab === 'unread'
                        ? totalUnread
                        : tab === 'all'
                          ? totalUnread
                          : conversations
                              .filter((c) => {
                                if (tab === 'bookings')
                                  return c.otherParticipant.role === 'owner'
                                if (tab === 'support')
                                  return ['admin', 'superAdmin'].includes(
                                    c.otherParticipant.role,
                                  )
                                return false
                              })
                              .reduce((s, c) => s + c.unreadCount, 0)

                    return (
                      <Button
                        key={tab}
                        variant="ghost"
                        onClick={() => setActiveSubTab(tab)}
                        className={cn(
                          'relative pb-3 text-[11px] font-extrabold capitalize tracking-wider whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 rounded-none h-auto px-0 hover:bg-transparent',
                          activeSubTab === tab
                            ? 'text-primary'
                            : 'text-muted-dark hover:text-muted-foreground',
                        )}
                      >
                        {tab}
                        {tabUnread > 0 && (
                          <span
                            className={cn(
                              'w-4',
                              'h-4',
                              'bg-primary',
                              'text-primary-foreground',
                              'text-[9px]',
                              'font-black',
                              'rounded-full',
                              'flex',
                              'items-center',
                              'justify-center',
                            )}
                          >
                            {tabUnread > 9 ? '9+' : tabUnread}
                          </span>
                        )}
                        {activeSubTab === tab && (
                          <div
                            className={cn(
                              'absolute',
                              'bottom-0',
                              'left-0',
                              'right-0',
                              'h-[2px]',
                              'bg-primary',
                              'rounded-full',
                            )}
                          />
                        )}
                      </Button>
                    )
                  },
                )}
              </div>
            </div>

            {/* Chat Items */}
            <div
              className={cn(
                'flex-1',
                'overflow-y-auto',
                'p-3',
                'space-y-0.5',
                'scrollbar-thin',
              )}
            >
              {isLoadingConversations ? (
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-center',
                    'h-32',
                  )}
                >
                  <Loader2
                    size={20}
                    className={cn('animate-spin', 'text-primary')}
                  />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div
                  className={cn(
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'h-full',
                    'gap-3',
                    'py-10',
                  )}
                >
                  <MessageSquare
                    size={32}
                    className="text-muted-foreground/30"
                  />
                  <p
                    className={cn(
                      'text-[11px]',
                      'font-bold',
                      'text-muted-dark',
                      'text-center',
                    )}
                  >
                    {searchQuery
                      ? 'No conversations match your search.'
                      : 'No conversations yet.'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id
                  const isOnline =
                    checkOnline(conv.otherParticipant.id) ||
                    conv.otherParticipant.isOnline

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all',
                        isSelected
                          ? 'bg-primary-soft border border-primary-border/60 shadow-sm'
                          : 'hover:bg-muted-light/60 border border-transparent',
                      )}
                    >
                      <UserAvatar
                        image={conv.otherParticipant.image}
                        name={conv.otherParticipant.name}
                        isOnline={isOnline}
                      />
                      <div className={cn('flex-1', 'min-w-0')}>
                        <div
                          className={cn(
                            'flex',
                            'items-center',
                            'justify-between',
                          )}
                        >
                          <h4
                            className={cn(
                              'text-[12px] truncate',
                              conv.unreadCount > 0
                                ? 'font-black text-foreground'
                                : 'font-bold text-foreground/90',
                            )}
                          >
                            {conv.otherParticipant.name}
                          </h4>
                          <span
                            className={cn(
                              'text-[9px]',
                              'font-bold',
                              'text-muted-dark',
                              'shrink-0',
                              'ml-2',
                            )}
                          >
                            {conv.lastMessage
                              ? formatMsgTime(conv.lastMessage.createdAt)
                              : formatMsgTime(conv.updatedAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'text-[10px] truncate mt-0.5',
                            conv.unreadCount > 0
                              ? 'text-foreground font-extrabold'
                              : 'text-muted-dark font-medium',
                          )}
                        >
                          {conv.lastMessage
                            ? conv.lastMessage.senderId === currentUserId
                              ? `You: ${conv.lastMessage.content}`
                              : conv.lastMessage.content
                            : 'No messages yet'}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <div className="shrink-0">
                          {conv.unreadCount > 1 ? (
                            <span
                              className={cn(
                                'w-5',
                                'h-5',
                                'bg-primary',
                                'text-primary-foreground',
                                'text-[9px]',
                                'font-black',
                                'rounded-full',
                                'flex',
                                'items-center',
                                'justify-center',
                              )}
                            >
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          ) : (
                            <div
                              className={cn(
                                'w-2.5',
                                'h-2.5',
                                'bg-primary',
                                'rounded-full',
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Left Footer */}
            <div
              className={cn(
                'border-t',
                'border-border/30',
                'px-5',
                'py-4',
                'shrink-0',
              )}
            >
              <p
                className={cn(
                  'text-[10px]',
                  'text-muted-dark',
                  'font-semibold',
                  'mb-1',
                )}
              >
                Can't find your conversation?
              </p>
              <Button
                variant="ghost"
                className={cn(
                  'text-primary',
                  'text-[10px]',
                  'font-black',
                  'flex',
                  'items-center',
                  'gap-0.5',
                  'hover:underline',
                  'cursor-pointer',
                  'h-auto',
                  'p-0',
                  'hover:bg-transparent',
                )}
              >
                View archived messages{' '}
                <ChevronRight size={10} strokeWidth={3} />
              </Button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Active Chat ── */}
          <div
            className={cn(
              'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
              !showMobileChat ? 'hidden lg:flex' : 'flex',
            )}
          >
            {!activeConversation ? (
              <EmptyState />
            ) : (
              <>
                {/* Chat Header */}
                <div
                  className={cn(
                    'px-6',
                    'py-4',
                    'border-b',
                    'border-border/30/70',
                    'flex',
                    'items-center',
                    'justify-between',
                    'shrink-0',
                    'bg-card/80',
                    'backdrop-blur-sm',
                  )}
                >
                  <div className={cn('flex', 'items-center', 'gap-3')}>
                    {/* Back on mobile */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileChat(false)}
                      className={cn(
                        'lg:hidden',
                        'h-8',
                        'w-8',
                        'bg-muted-light',
                        'hover:bg-muted/50',
                        'rounded-lg',
                        'text-muted-foreground',
                        'cursor-pointer',
                        'transition-colors',
                      )}
                    >
                      <ArrowLeft size={15} />
                    </Button>

                    <UserAvatar
                      image={activeConversation.otherParticipant.image}
                      name={activeConversation.otherParticipant.name}
                      isOnline={
                        checkOnline(activeConversation.otherParticipant.id) ||
                        activeConversation.otherParticipant.isOnline
                      }
                    />

                    <div>
                      <h3
                        className={cn(
                          'text-[13px]',
                          'font-black',
                          'text-foreground',
                        )}
                      >
                        {activeConversation.otherParticipant.name}
                      </h3>
                      <div
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-1.5',
                          'mt-0.5',
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            checkOnline(
                              activeConversation.otherParticipant.id,
                            ) || activeConversation.otherParticipant.isOnline
                              ? 'bg-emerald-500'
                              : 'bg-muted-dark/20',
                          )}
                        />
                        <span
                          className={cn(
                            'text-[9px]',
                            'font-bold',
                            'text-muted-dark',
                          )}
                        >
                          {checkOnline(
                            activeConversation.otherParticipant.id,
                          ) || activeConversation.otherParticipant.isOnline
                            ? 'Online'
                            : 'Offline'}
                        </span>
                        {isOtherPersonTyping && (
                          <span
                            className={cn(
                              'text-[9px]',
                              'font-black',
                              'text-primary',
                              'animate-pulse',
                              'ml-1',
                            )}
                          >
                            • typing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={cn('flex', 'items-center', 'gap-1')}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toast.success(
                          `Calling ${activeConversation.otherParticipant.name}...`,
                        )
                      }
                      className={cn(
                        'w-9',
                        'h-9',
                        'hover:bg-muted-light',
                        'rounded-xl',
                        'text-muted-dark',
                        'hover:text-muted-foreground',
                        'cursor-pointer',
                        'transition-colors',
                      )}
                    >
                      <Phone size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toast.success(
                          `Starting video call with ${activeConversation.otherParticipant.name}...`,
                        )
                      }
                      className={cn(
                        'w-9',
                        'h-9',
                        'hover:bg-muted-light',
                        'rounded-xl',
                        'text-muted-dark',
                        'hover:text-muted-foreground',
                        'cursor-pointer',
                        'transition-colors',
                      )}
                    >
                      <Video size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toast.info('Conversation options coming soon')
                      }
                      className={cn(
                        'w-9',
                        'h-9',
                        'hover:bg-muted-light',
                        'rounded-xl',
                        'text-muted-dark',
                        'hover:text-muted-foreground',
                        'cursor-pointer',
                        'transition-colors',
                      )}
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className={cn(
                    'flex-1',
                    'overflow-y-auto',
                    'px-5',
                    'py-5',
                    'space-y-5',
                    'bg-muted-light/20',
                    'scrollbar-thin',
                  )}
                >
                  {isLoadingMessages ? (
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'justify-center',
                        'h-full',
                      )}
                    >
                      <div
                        className={cn(
                          'flex',
                          'flex-col',
                          'items-center',
                          'gap-3',
                        )}
                      >
                        <Loader2
                          size={24}
                          className={cn('animate-spin', 'text-primary')}
                        />
                        <p
                          className={cn(
                            'text-[11px]',
                            'font-bold',
                            'text-muted-dark',
                          )}
                        >
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      className={cn(
                        'flex',
                        'flex-col',
                        'items-center',
                        'justify-center',
                        'h-full',
                        'gap-3',
                      )}
                    >
                      <div
                        className={cn(
                          'w-12',
                          'h-12',
                          'rounded-2xl',
                          'bg-muted/50',
                          'flex',
                          'items-center',
                          'justify-center',
                        )}
                      >
                        <MessageSquare size={20} className="text-muted-dark" />
                      </div>
                      <p
                        className={cn(
                          'text-[11px]',
                          'font-bold',
                          'text-muted-dark',
                          'text-center',
                        )}
                      >
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    groupedMessages.map((group) => (
                      <div key={group.date} className="space-y-3">
                        {/* Date separator */}
                        <div className={cn('flex', 'justify-center')}>
                          <span
                            className={cn(
                              'px-3',
                              'py-1',
                              'bg-muted/50',
                              'rounded-full',
                              'text-[9px]',
                              'font-black',
                              'text-muted-dark',
                              'uppercase',
                              'tracking-widest',
                            )}
                          >
                            {group.date === format(new Date(), 'dd MMM yyyy')
                              ? 'Today'
                              : group.date}
                          </span>
                        </div>

                        {/* Messages */}
                        {group.msgs.map((msg) => {
                          const isMe = msg.senderId === currentUserId
                          const { replyQuote, text: msgText } = parseMessage(
                            msg.content,
                          )
                          const isHovered = hoveredMsgId === msg.id
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                'flex gap-2.5 group/msg',
                                isMe
                                  ? 'flex-row-reverse ml-auto max-w-[82%]'
                                  : 'mr-auto max-w-[82%]',
                              )}
                              onMouseEnter={() => setHoveredMsgId(msg.id)}
                              onMouseLeave={() => setHoveredMsgId(null)}
                            >
                              {/* Avatar for other person */}
                              {!isMe && (
                                <div className={cn('self-end', 'shrink-0')}>
                                  <UserAvatar
                                    image={
                                      activeConversation.otherParticipant.image
                                    }
                                    name={
                                      activeConversation.otherParticipant.name
                                    }
                                    size="sm"
                                  />
                                </div>
                              )}

                              <div
                                className={cn('flex flex-col gap-1 min-w-0')}
                              >
                                {/* Image attachments grid */}
                                {msg.attachments &&
                                  msg.attachments.length > 0 && (
                                    <div
                                      className={cn(
                                        'grid gap-1.5 rounded-2xl overflow-hidden shadow-sm',
                                        msg.attachments.length === 1
                                          ? 'grid-cols-1 max-w-[220px]'
                                          : msg.attachments.length === 2
                                            ? 'grid-cols-2 max-w-[280px]'
                                            : 'grid-cols-3 max-w-[320px]',
                                        isMe
                                          ? 'rounded-tr-sm'
                                          : 'rounded-tl-sm',
                                      )}
                                    >
                                      {msg.attachments.map((src, i) => (
                                        <Button
                                          key={i}
                                          type="button"
                                          variant="ghost"
                                          onClick={() =>
                                            openLightbox(msg.attachments, i)
                                          }
                                          className="relative group/img block overflow-hidden focus:outline-none p-0 h-auto rounded-none hover:bg-transparent"
                                        >
                                          <img
                                            src={src}
                                            alt={`attachment-${i + 1}`}
                                            className="w-full h-28 object-cover transition-transform duration-200 group-hover/img:scale-105"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                            <ZoomIn
                                              size={20}
                                              className="text-white opacity-0 group-hover/img:opacity-100 drop-shadow-lg transition-opacity duration-200"
                                            />
                                          </div>
                                        </Button>
                                      ))}
                                    </div>
                                  )}

                                {/* Bubble */}
                                {msg.content && (
                                  <div
                                    className={cn(
                                      'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative',
                                      isMe
                                        ? 'bg-primary-soft/40 text-primary rounded-2xl rounded-tr-sm'
                                        : 'bg-card text-foreground/80 border border-border/30 rounded-2xl rounded-tl-sm',
                                    )}
                                  >
                                    {/* Quoted reply block */}
                                    {replyQuote && (
                                      <div
                                        className={cn(
                                          'flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded-lg',
                                          isMe
                                            ? 'bg-primary/10 border-l-2 border-primary/40'
                                            : 'bg-muted/40 border-l-2 border-muted-foreground/30',
                                        )}
                                      >
                                        <CornerUpLeft
                                          size={10}
                                          className={cn(
                                            'shrink-0 mt-0.5',
                                            isMe
                                              ? 'text-primary/60'
                                              : 'text-muted-dark',
                                          )}
                                        />
                                        <p
                                          className={cn(
                                            'text-[9.5px] leading-snug truncate',
                                            isMe
                                              ? 'text-primary/70'
                                              : 'text-muted-dark',
                                          )}
                                        >
                                          {replyQuote}
                                        </p>
                                      </div>
                                    )}
                                    {msgText}
                                  </div>
                                )}

                                {/* Time + read receipt */}
                                <div
                                  className={cn(
                                    'flex items-center gap-1',
                                    isMe ? 'justify-end' : 'justify-start',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'text-[8px]',
                                      'font-bold',
                                      'text-muted-dark',
                                    )}
                                  >
                                    {formatMsgTime(msg.createdAt)}
                                  </span>
                                  {isMe &&
                                    (msg.isRead ? (
                                      <CheckCheck
                                        size={11}
                                        className="text-emerald-600"
                                        strokeWidth={2.5}
                                      />
                                    ) : (
                                      <Check
                                        size={11}
                                        className="text-muted-dark"
                                        strokeWidth={2.5}
                                      />
                                    ))}
                                </div>
                              </div>

                              {/* Hover Reply Action */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReply(msg, isMe)}
                                className={cn(
                                  'self-center shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150',
                                  'bg-muted/60 hover:bg-primary/10 text-muted-dark hover:text-primary border border-border/30',
                                  isHovered
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-75 pointer-events-none',
                                )}
                                title="Reply"
                              >
                                <Reply size={12} strokeWidth={2.5} />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {isOtherPersonTyping && <TypingBubble />}
                </div>

                {/* Input Dock */}
                <div
                  className={cn('border-t border-border/30 bg-card shrink-0')}
                >
                  {/* Reply Preview Bar */}
                  {replyTarget && (
                    <div
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5',
                        'bg-primary/5 border-b border-primary/10',
                        'animate-in slide-in-from-bottom-1 duration-150',
                      )}
                    >
                      <CornerUpLeft
                        size={13}
                        className="text-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-primary uppercase tracking-wider mb-0.5">
                          Replying to {replyTarget.senderName}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-dark truncate">
                          {replyTarget.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplyTarget(null)}
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-muted-dark hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <X size={11} strokeWidth={2.5} />
                      </Button>
                    </div>
                  )}
                  {/* Attachment previews (before send) */}
                  {pendingPreviews.length > 0 && (
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
                      {pendingPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/40 shadow-sm group"
                        >
                          <img
                            src={src}
                            alt={`preview-${i}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(i)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0 rounded-none hover:bg-black/50 w-full h-full"
                          >
                            <X
                              size={14}
                              className="text-white"
                              strokeWidth={2.5}
                            />
                          </Button>
                        </div>
                      ))}
                      {pendingFiles.length < 5 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-14 h-14 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-muted-dark hover:text-primary transition-all cursor-pointer"
                        >
                          <ImagePlus size={18} />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={
                        !isConnected ||
                        !activeConversationId ||
                        pendingFiles.length >= 5
                      }
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'w-10',
                        'h-10',
                        'bg-muted-light',
                        'hover:bg-primary/10',
                        'hover:text-primary',
                        'rounded-xl',
                        'text-muted-foreground/85',
                        'transition-colors',
                        'cursor-pointer',
                        'shrink-0',
                        'disabled:opacity-40',
                        pendingFiles.length > 0 &&
                          'text-primary bg-primary-soft/40',
                      )}
                      title={`Attach images (${pendingFiles.length}/5)`}
                    >
                      <Paperclip size={15} />
                    </Button>

                    <div className={cn('flex-1', 'relative')}>
                      <Input
                        ref={inputRef}
                        placeholder={
                          isConnected
                            ? replyTarget
                              ? `Reply to ${replyTarget.senderName}...`
                              : 'Type a message...'
                            : 'Connecting...'
                        }
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={!isConnected || !activeConversationId}
                        className={cn(
                          'h-10',
                          'pr-10',
                          'bg-muted-light',
                          'border-none',
                          'rounded-xl',
                          'text-[11px]',
                          'font-bold',
                          'focus-visible:ring-1',
                          'focus-visible:ring-primary/20',
                          'disabled:opacity-50',
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={cn(
                          'absolute',
                          'right-2',
                          'top-[7px]',
                          'h-7',
                          'w-7',
                          'text-muted-dark',
                          'hover:text-muted-foreground',
                          'hover:bg-transparent',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <Smile
                          size={15}
                          className={cn(showEmojiPicker && 'text-primary')}
                        />
                      </Button>

                      {showEmojiPicker && (
                        <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setInputText((prev) => prev + emojiData.emoji)
                            }}
                            width={280}
                            height={320}
                            previewConfig={{ showPreview: false }}
                            searchDisabled={false}
                            skinTonesDisabled={true}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={
                        (!inputText.trim() && pendingFiles.length === 0) ||
                        !isConnected ||
                        isUploading
                      }
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground cursor-pointer transition-all shadow-md active:scale-95 shrink-0',
                        (inputText.trim() || pendingFiles.length > 0) &&
                          isConnected &&
                          !isUploading
                          ? 'bg-primary hover:bg-primary-hover'
                          : 'bg-muted text-muted-dark cursor-not-allowed shadow-none',
                      )}
                    >
                      {isUploading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} className="ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
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
