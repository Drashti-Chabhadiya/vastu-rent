import { useState, useEffect, useRef, useCallback } from 'react'
import EmojiPicker, { Emoji, EmojiStyle } from 'emoji-picker-react'
import {
  ArrowLeft,
  Phone,
  Video,
  MessageSquare,
  Loader2,
  CheckCheck,
  Check,
  Reply,
  CornerUpLeft,
  X,
  ImagePlus,
  Paperclip,
  Smile,
  Send,
  ZoomIn,
  Leaf,
  MoreVertical,
  Copy,
  Edit3,
  Trash2,
  Forward,
  Info,
  ArrowRightLeft,
  Search,
  ChevronUp,
  ChevronDown,
  Pin,
  Star,
  Clock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { authClient } from '#/lib/auth/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useDeleteConversation, useUploadChatFile } from '#/hook'
import type { Message } from '../../../../../hook/use-chat'
import { UserAvatar } from './UserAvatar'
import { TypingBubble } from './TypingBubble'
import { ConversationOptionsMenu } from './ConversationOptionsMenu'
import { useChatStore } from '../../../../../store/useChatStore'
import { Skeleton } from '#/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { ForwardDialog } from './ForwardDialog'
import { MessageInfoDialog } from './MessageInfoDialog'
import { MediaBrowserDialog } from './MediaBrowserDialog'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'

import { parseMessage, formatMsgTime, formatLastActive, buildReplyContent } from '#/lib/chat-utils'

const getEmojiUnified = (emojiStr: string): string => {
  return Array.from(emojiStr)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join('-')
}

export function ChatWindow() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false
  const deleteConversation = useDeleteConversation()
  const uploadChatFile = useUploadChatFile()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Consume Zustand global state
  const {
    isConnected,
    conversations,
    activeConversationId,
    messages,
    isLoadingMessages,
    isOtherPersonTyping,
    currentUserId,
    sendMessage,
    emitTyping,
    checkOnline,
    editMessage,
    deleteMessage,
    forwardMessage,
    clearChat: onClearChat,
    toggleStarMessage,
    togglePinMessage,
    reactToMessage,
    removeReaction,

    showMobileChat,
    setShowMobileChat,
    hoveredMsgId,
    setHoveredMsgId,
    replyTarget,
    setReplyTarget,
    pendingPreviews,
    pendingFiles,
    removeFile,
    addPendingFiles,
    addPendingPreviews,
    clearAttachments,
    inputText,
    setInputText,
    showEmojiPicker,
    setShowEmojiPicker,
    isUploading,
    setIsUploading,
    openLightbox,
  } = useChatStore()

  // Local Component Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Derive active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

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
            return await uploadChatFile.mutateAsync(file)
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
      clearAttachments()
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
    addPendingFiles(allowed)
    addPendingPreviews(newPreviews)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
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
    [activeConversation, setReplyTarget],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [canDeleteForEveryone, setCanDeleteForEveryone] = useState(false)

  const [forwardTargetId, setForwardTargetId] = useState<string | string[] | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)

  const [infoTargetMsg, setInfoTargetMsg] = useState<Message | null>(null)
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  // --- Search state ---
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  // --- Multi-select state ---
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([])

  // --- Media visibility state ---
  const [hideMedia, setHideMedia] = useState(false)
  const [revealedMediaMsgs, setRevealedMediaMsgs] = useState<string[]>([])

  // --- Shared Media Browser state ---
  const [showMediaBrowser, setShowMediaBrowser] = useState(false)

  // --- Quick Reaction & Emoji Dialog state ---
  const [activeReactMsgId, setActiveReactMsgId] = useState<string | null>(null)
  const [fullReactMsgId, setFullReactMsgId] = useState<string | null>(null)

  // --- Search matches calculation ---
  const searchMatches = messages.filter(
    (m) =>
      !m.isDeleted &&
      m.content &&
      m.content.toLowerCase().includes(searchText.toLowerCase()) &&
      searchText.trim() !== '',
  )

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-yellow-200/40', 'transition-all', 'duration-500')
      setTimeout(() => {
        el.classList.remove('bg-yellow-200/40')
      }, 2000)
    }
  }

  const handleSearchNavigate = (direction: 'up' | 'down') => {
    if (searchMatches.length === 0) return
    let nextIndex = currentMatchIndex
    if (direction === 'up') {
      nextIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : searchMatches.length - 1
    } else {
      nextIndex = currentMatchIndex < searchMatches.length - 1 ? currentMatchIndex + 1 : 0
    }
    setCurrentMatchIndex(nextIndex)
    scrollToMessage(searchMatches[nextIndex].id)
  }

  const highlightText = (text: string, search: string) => {
    if (!search || !search.trim()) return text
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-foreground font-black px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  // --- Multi-select handlers ---
  const handleSelectMessage = (msgId: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId],
    )
  }

  const handleBulkStar = async () => {
    if (selectedMsgIds.length === 0) return
    try {
      await Promise.all(selectedMsgIds.map((id) => toggleStarMessage(id)))
      toast.success('Messages starred status updated')
      setSelectedMsgIds([])
      setIsMultiSelectMode(false)
    } catch {
      toast.error('Failed to star messages')
    }
  }

  const handleBulkCopy = () => {
    if (selectedMsgIds.length === 0) return
    const textToCopy = messages
      .filter((m) => selectedMsgIds.includes(m.id))
      .map((m) => {
        const { text } = parseMessage(m.content)
        return `[${format(new Date(m.createdAt), 'HH:mm')}] ${m.sender.name}: ${text}`
      })
      .join('\n')
    navigator.clipboard.writeText(textToCopy)
    toast.success('Copied selected messages to clipboard!')
    setSelectedMsgIds([])
    setIsMultiSelectMode(false)
  }

  const handleBulkDelete = async () => {
    if (selectedMsgIds.length === 0) return
    if (!confirm(`Are you sure you want to delete these ${selectedMsgIds.length} messages for you?`)) return
    try {
      await Promise.all(selectedMsgIds.map((id) => deleteMessage({ messageId: id, mode: 'me' })))
      toast.success('Messages deleted')
      setSelectedMsgIds([])
      setIsMultiSelectMode(false)
    } catch {
      toast.error('Failed to delete messages')
    }
  }

  const handleBulkForward = () => {
    if (selectedMsgIds.length === 0) return
    setForwardTargetId(selectedMsgIds)
    setShowForwardDialog(true)
  }

  // Helper to format disappearing message text
  const getDisappearingDurationText = (sec: number) => {
    if (sec === 86400) return '24 hours'
    if (sec === 604800) return '7 days'
    if (sec === 7776000) return '90 days'
    return `${sec / 86400} days`
  }

  // Pinned messages banner calculation
  const pinnedMessages = messages.filter(
    (m) => !m.isDeleted && m.pinnedBy && m.pinnedBy.length > 0,
  )
  const activePinnedMessage = pinnedMessages[pinnedMessages.length - 1] || null

  // Reset search, multi-select, and revealed media messages on conversation change
  useEffect(() => {
    setShowSearch(false)
    setSearchText('')
    setCurrentMatchIndex(0)
    setIsMultiSelectMode(false)
    setSelectedMsgIds([])
    setRevealedMediaMsgs([])
    setActiveReactMsgId(null)
    setFullReactMsgId(null)
  }, [activeConversation?.id])

  const handleOpenDelete = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    setDeleteTargetId(msgId)

    const fifteenMinutes = 15 * 60 * 1000
    const isWithinTimeLimit = Date.now() - new Date(msg.createdAt).getTime() < fifteenMinutes
    const isSender = msg.senderId === currentUserId
    const isAdmin = session?.user?.role === 'admin'
    setCanDeleteForEveryone((isSender && isWithinTimeLimit) || isAdmin)

    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async (mode: 'me' | 'everyone') => {
    if (!deleteTargetId) return
    try {
      await deleteMessage({ messageId: deleteTargetId, mode })
      setShowDeleteDialog(false)
      setDeleteTargetId(null)
      toast.success(
        mode === 'everyone' ? 'Message deleted for everyone' : 'Message deleted for you',
      )
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete message')
    }
  }

  const handleUpdateMessage = async (msgId: string) => {
    if (!editingText.trim()) return
    try {
      await editMessage({ messageId: msgId, content: editingText.trim() })
      setEditingMsgId(null)
      setEditingText('')
      toast.success('Message updated!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update message')
    }
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Message text copied to clipboard!')
  }

  const handleOpenForward = (msgId: string) => {
    setForwardTargetId(msgId)
    setShowForwardDialog(true)
  }

  const handleOpenInfo = (msg: Message) => {
    setInfoTargetMsg(msg)
    setShowInfoDialog(true)
  }
  if (!activeConversation) {
    return (
      <div
        className={cn(
          'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
          !showMobileChat ? 'hidden lg:flex' : 'flex',
        )}
      >
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
            <MessageSquare
              size={28}
              className="text-primary"
              fill="currentColor"
            />
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
      </div>
    )
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

  const otherPersonOnline = checkOnline(activeConversation.otherParticipant.id)
  const canSeeStatus =
    myShowOnline &&
    activeConversation.otherParticipant.lastActive !== null &&
    activeConversation.otherParticipant.lastActive !== undefined
  const showOnlineStatus = canSeeStatus && otherPersonOnline

  return (
    <div
      className={cn(
        'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
        !showMobileChat ? 'hidden lg:flex' : 'flex',
      )}
    >
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
            isOnline={canSeeStatus ? showOnlineStatus : undefined}
          />

          <div>
            <div className="flex items-center gap-1">
              <h3 className={cn('text-[13px]', 'font-black', 'text-foreground')}>
                {activeConversation.otherParticipant.name}
              </h3>
              {activeConversation.otherParticipant.isGreenMember && (
                <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
              )}
            </div>
            {canSeeStatus ? (
              <div className={cn('flex', 'items-center', 'gap-1.5', 'mt-0.5')}>
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    showOnlineStatus ? 'bg-emerald-500' : 'bg-muted-dark/20',
                  )}
                />
                <span
                  className={cn('text-[9px]', 'font-bold', 'text-muted-dark')}
                >
                  {showOnlineStatus
                    ? 'Online'
                    : (() => {
                      const formatted = formatLastActive(activeConversation.otherParticipant.lastActive)
                      return formatted === 'Offline' ? 'Offline' : `last seen ${formatted}`
                    })()}
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
            ) : (
              isOtherPersonTyping && (
                <div className={cn('flex', 'items-center', 'gap-1.5', 'mt-0.5')}>
                  <span
                    className={cn(
                      'text-[9px]',
                      'font-black',
                      'text-primary',
                      'animate-pulse',
                    )}
                  >
                    typing...
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className={cn('flex', 'items-center', 'gap-1')}>
          {/* Hide Media Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setHideMedia(!hideMedia)
              setRevealedMediaMsgs([])
            }}
            className={cn(
              'w-9 h-9 hover:bg-muted-light rounded-xl cursor-pointer transition-colors',
              hideMedia ? 'text-primary bg-primary/10' : 'text-muted-dark hover:text-muted-foreground'
            )}
            title={hideMedia ? "Show Media" : "Hide Media"}
          >
            {hideMedia ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>

          {/* Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowSearch(!showSearch)
              if (showSearch) {
                setSearchText('')
                setCurrentMatchIndex(0)
              }
            }}
            className={cn(
              'w-9 h-9 hover:bg-muted-light rounded-xl cursor-pointer transition-colors',
              showSearch ? 'text-primary bg-primary/10' : 'text-muted-dark hover:text-muted-foreground'
            )}
            title="Search Messages"
          >
            <Search size={16} />
          </Button>

          {/* Multi-select Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode)
              setSelectedMsgIds([])
            }}
            className={cn(
              'w-9 h-9 hover:bg-muted-light rounded-xl cursor-pointer transition-colors',
              isMultiSelectMode ? 'text-primary bg-primary/10' : 'text-muted-dark hover:text-muted-foreground'
            )}
            title="Select Messages"
          >
            <CheckSquare size={16} />
          </Button>

          {/* Shared Media Browser */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMediaBrowser(true)}
            className="w-9 h-9 hover:bg-muted-light rounded-xl text-muted-dark hover:text-muted-foreground cursor-pointer transition-colors"
            title="Shared Media"
          >
            <ImagePlus size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              toast.success(`Calling ${activeConversation.otherParticipant.name}...`)
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
              toast.success(`Starting video call with ${activeConversation.otherParticipant.name}...`)
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
          <ConversationOptionsMenu
            onViewProfile={() =>
              navigate({
                to: '/users/$id',
                params: { id: activeConversation.otherParticipant.id },
              })
            }
            onArchive={() => toast.info('Archive feature coming soon')}
            onClearChat={() => setShowClearConfirm(true)}
            onDelete={async () => {
              try {
                await deleteConversation.mutateAsync(activeConversation.id)
                toast.success('Conversation deleted')
              } catch {
                toast.error('Failed to delete conversation')
              }
            }}
          />
        </div>
      </div>

      {/* Message Search Bar Panel */}
      {showSearch && (
        <div className="px-6 py-2.5 border-b border-border/20 bg-muted-light/35 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-200">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-3 text-muted-dark" />
            <Input
              placeholder="Search in this chat..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentMatchIndex(0)
              }}
              className="h-10 pl-9 pr-24 bg-card border-none rounded-xl text-[11px] font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
            />
            {searchText.trim() !== "" && (
              <span className="absolute right-3 top-3 text-[10px] font-bold text-muted-dark bg-muted-light px-2 py-0.5 rounded-md">
                {searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : 'No matches'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={searchMatches.length === 0}
              onClick={() => handleSearchNavigate('up')}
              className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
              title="Previous match"
            >
              <ChevronUp size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={searchMatches.length === 0}
              onClick={() => handleSearchNavigate('down')}
              className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
              title="Next match"
            >
              <ChevronDown size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(false)
                setSearchText('')
                setCurrentMatchIndex(0)
              }}
              className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
              title="Close search"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Multi-Select Action Bar Panel */}
      {isMultiSelectMode && (
        <div className="px-6 py-3 border-b border-border/20 bg-primary/5 flex items-center justify-between gap-4 shrink-0 animate-in slide-in-from-top duration-250">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMultiSelectMode(false)
                setSelectedMsgIds([])
              }}
              className="w-7 h-7 rounded-full hover:bg-muted-light text-muted-dark hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </Button>
            <span className="text-[12px] font-black text-primary">
              {selectedMsgIds.length} message{selectedMsgIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBulkStar}
              disabled={selectedMsgIds.length === 0}
              variant="ghost"
              className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
            >
              <Star size={12} className="fill-transparent" />
              Star/Unstar
            </Button>
            <Button
              onClick={handleBulkCopy}
              disabled={selectedMsgIds.length === 0}
              variant="ghost"
              className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
            >
              <Copy size={12} />
              Copy
            </Button>
            <Button
              onClick={handleBulkForward}
              disabled={selectedMsgIds.length === 0}
              variant="ghost"
              className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
            >
              <Forward size={12} />
              Forward
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={selectedMsgIds.length === 0}
              variant="ghost"
              className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-red-50 text-red-600 cursor-pointer border border-red-200"
            >
              <Trash2 size={12} />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Pinned Messages Banner */}
      {activePinnedMessage && (
        <div className="bg-primary/5 border-b border-border/20 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-200">
          <div
            onClick={() => scrollToMessage(activePinnedMessage.id)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 hover:opacity-90"
          >
            <Pin size={12} className="text-primary rotate-45 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-primary uppercase tracking-wider mb-0.5">
                Pinned Message
              </p>
              <p className="text-[10px] font-semibold text-muted-dark truncate">
                {parseMessage(activePinnedMessage.content).text || "Media attachment"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async (e) => {
              e.stopPropagation()
              await togglePinMessage(activePinnedMessage.id)
            }}
            className="w-6 h-6 rounded-full hover:bg-muted-light text-muted-dark hover:text-foreground cursor-pointer shrink-0"
            title="Unpin message"
          >
            <X size={12} />
          </Button>
        </div>
      )}

      {/* Disappearing Messages Info Banner */}
      {activeConversation.disappearingDuration ? activeConversation.disappearingDuration > 0 && (
        <div className="bg-muted-light/60 border-b border-border/20 px-6 py-2.5 flex items-center gap-2 text-[10px] font-bold text-muted-dark shrink-0 animate-in slide-in-from-top duration-200">
          <Clock size={12} className="text-primary shrink-0" />
          <span>Disappearing messages is active. Messages will disappear for everyone after {getDisappearingDurationText(activeConversation.disappearingDuration)}.</span>
        </div>
      ) : null}

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
          <div className="space-y-6 px-1 py-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => {
              const isMe = i % 2 === 1
              return (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2.5 max-w-[70%]',
                    isMe ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  )}
                >
                  {!isMe && <Skeleton className="w-8 h-8 rounded-full shrink-0 self-end" />}
                  <div className="space-y-1.5">
                    <Skeleton
                      className={cn(
                        'h-9 rounded-2xl px-4 py-2.5',
                        isMe ? 'bg-primary/20 rounded-tr-sm w-36' : 'bg-muted rounded-tl-sm w-44',
                      )}
                    />
                    <Skeleton className={cn('h-2.5 w-10 rounded', isMe ? 'ml-auto' : '')} />
                  </div>
                </div>
              )
            })}
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
                const { replyQuote, text: msgText } = parseMessage(msg.content)
                const isHovered = hoveredMsgId === msg.id
                const isStarred = msg.starredBy?.includes(currentUserId || '')
                const isPinned = msg.pinnedBy?.includes(currentUserId || '')

                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    onClick={isMultiSelectMode ? () => handleSelectMessage(msg.id) : undefined}
                    className={cn(
                      'flex gap-2.5 group/msg relative p-1.5 rounded-2xl transition-all',
                      isMultiSelectMode && 'cursor-pointer hover:bg-muted-light/45',
                      selectedMsgIds.includes(msg.id) && 'bg-primary-soft/50 border border-primary-border/20 shadow-sm',
                      isMe
                        ? 'flex-row-reverse ml-auto max-w-[82%]'
                        : 'mr-auto max-w-[82%]',
                    )}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* Multi-select check icon */}
                    {isMultiSelectMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectMessage(msg.id)
                        }}
                        className="self-center p-1 rounded-lg text-primary cursor-pointer shrink-0 transition-colors"
                      >
                        {selectedMsgIds.includes(msg.id) ? (
                          <CheckSquare size={16} className="fill-primary text-white" />
                        ) : (
                          <Square size={16} className="text-muted-dark/60" />
                        )}
                      </button>
                    )}

                    {/* Quick Reactions Bar */}
                    {!msg.isDeleted && (isHovered || activeReactMsgId === msg.id) && !isMultiSelectMode && (
                      <div className={cn(
                        "flex items-center gap-1.5 bg-card border border-border/30 shadow-md rounded-full px-2 py-1.5 absolute -top-8 z-20 animate-in zoom-in-95 duration-100",
                        isMe ? "right-2" : "left-10"
                      )}>
                        {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => {
                          const userReacted = msg.reactions?.some(r => r.userId === currentUserId && r.emoji === emoji)
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (userReacted) {
                                  await removeReaction(msg.id)
                                } else {
                                  await reactToMessage({ messageId: msg.id, emoji })
                                }
                                setActiveReactMsgId(null)
                              }}
                              className={cn(
                                "hover:scale-125 transition-transform duration-100 p-1 cursor-pointer hover:drop-shadow-sm flex items-center justify-center rounded-full",
                                userReacted && "bg-primary/10"
                              )}
                            >
                              <Emoji unified={getEmojiUnified(emoji)} emojiStyle={EmojiStyle.APPLE} size={18} />
                            </button>
                          )
                        })}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFullReactMsgId(msg.id)
                            setActiveReactMsgId(null)
                          }}
                          className="hover:scale-125 transition-transform duration-100 px-1 text-sm font-black text-muted-dark hover:text-foreground cursor-pointer flex items-center justify-center shrink-0"
                          title="Plus reaction picker"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Avatar for other person */}
                    {!isMe && (
                      <div className={cn('self-end', 'shrink-0')}>
                        <UserAvatar
                          image={activeConversation.otherParticipant.image}
                          name={activeConversation.otherParticipant.name}
                          size="sm"
                        />
                      </div>
                    )}

                    <div className={cn('flex flex-col gap-1 min-w-0')}>
                      {/* Image attachments grid */}
                      {!msg.isDeleted && msg.attachments && msg.attachments.length > 0 && (
                        <div
                          className={cn(
                            'grid gap-1.5 rounded-2xl overflow-hidden shadow-sm relative',
                            msg.attachments.length === 1
                              ? 'grid-cols-1 max-w-[220px]'
                              : msg.attachments.length === 2
                                ? 'grid-cols-2 max-w-[280px]'
                                : 'grid-cols-3 max-w-[320px]',
                            isMe ? 'rounded-tr-sm' : 'rounded-tl-sm',
                          )}
                        >
                          {hideMedia && !revealedMediaMsgs.includes(msg.id) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setRevealedMediaMsgs(prev => [...prev, msg.id])
                              }}
                              className="w-full h-24 bg-muted-light flex flex-col items-center justify-center p-3 text-center border border-border/20 gap-1.5 cursor-pointer outline-none hover:bg-muted-light/85 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center text-muted-dark shadow-sm">
                                <ImagePlus size={14} />
                              </div>
                              <span className="text-[9px] font-bold text-muted-dark">Media hidden</span>
                              <span className="text-[8px] font-medium text-muted-dark/70">Click to view</span>
                            </button>
                          ) : (
                            msg.attachments.map((src, i) => (
                              <Button
                                key={i}
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openLightbox(msg.attachments, i)
                                }}
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
                            ))
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      {msg.isDeleted ? (
                        <div
                          className={cn(
                            'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative italic text-muted-dark/70 flex items-center gap-1.5',
                            isMe
                              ? 'bg-primary-soft/20 rounded-2xl rounded-tr-sm'
                              : 'bg-muted/45 border border-border/20 rounded-2xl rounded-tl-sm',
                          )}
                        >
                          <span className="opacity-60 shrink-0"><X size={11} strokeWidth={3} /></span>
                          This message was deleted
                        </div>
                      ) : editingMsgId === msg.id ? (
                        <div
                          className={cn(
                            'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative',
                            isMe
                              ? 'bg-primary-soft/40 text-primary rounded-2xl rounded-tr-sm'
                              : 'bg-card text-foreground/80 border border-border/30 rounded-2xl rounded-tl-sm',
                          )}
                        >
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full text-[11px] font-bold bg-muted-light/50 text-foreground border border-border/20 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none h-14"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMsgId(null)}
                                className="h-6 px-2 text-[9px] font-black text-muted-dark rounded-md hover:bg-muted-light cursor-pointer shadow-none"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMessage(msg.id)}
                                className="h-6 px-2.5 text-[9px] font-black text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm cursor-pointer"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        msg.content && (
                          <div
                            className={cn(
                              'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative',
                              isMe
                                ? 'bg-primary-soft/40 text-primary rounded-2xl rounded-tr-sm'
                                : 'bg-card text-foreground/80 border border-border/30 rounded-2xl rounded-tl-sm',
                            )}
                          >
                            {/* Forwarded label */}
                            {msg.isForwarded && (
                              <div className="flex items-center gap-1 text-[8.5px] font-black text-muted-dark/85 uppercase tracking-wider mb-1">
                                <ArrowRightLeft size={9} strokeWidth={3.5} className="text-muted-dark/75" />
                                Forwarded
                              </div>
                            )}

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
                                    isMe ? 'text-primary/60' : 'text-muted-dark',
                                  )}
                                />
                                <p
                                  className={cn(
                                    'text-[9.5px] leading-snug truncate',
                                    isMe ? 'text-primary/70' : 'text-muted-dark',
                                  )}
                                >
                                  {replyQuote}
                                </p>
                              </div>
                            )}
                            {highlightText(msgText, searchText)}
                          </div>
                        )
                      )}

                      {/* Time + read receipt */}
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          isMe ? 'justify-end' : 'justify-start',
                        )}
                      >
                        <span
                          className={cn(
                            'text-[8px]',
                            'font-bold',
                            'text-muted-dark',
                            'flex items-center gap-1'
                          )}
                        >
                          {formatMsgTime(msg.createdAt)}
                          {isStarred && (
                            <Star size={9} className="text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          {msg.pinnedBy && msg.pinnedBy.length > 0 && (
                            <Pin size={9} className="text-primary rotate-45 shrink-0" />
                          )}
                        </span>
                        {msg.isEdited && !msg.isDeleted && (
                          <span className="text-[8px] font-bold text-muted-dark/65 italic">
                            edited
                          </span>
                        )}
                        {isMe && !msg.isDeleted &&
                          (msg.isRead || !!msg.readAt ? (
                            <CheckCheck
                              size={11}
                              className="text-emerald-600 fill-transparent"
                              strokeWidth={2.5}
                            />
                          ) : msg.deliveredAt ? (
                            <CheckCheck
                              size={11}
                              className="text-muted-dark/50 fill-transparent"
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

                      {/* Reaction badges */}
                      {!msg.isDeleted && msg.reactions && msg.reactions.length > 0 && (
                        <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                          {Array.from(new Set(msg.reactions.map(r => r.emoji))).map((emoji) => {
                            const reactUsers = msg.reactions!.filter(r => r.emoji === emoji)
                            const userReacted = reactUsers.some(r => r.userId === currentUserId)
                            const tooltipText = `Reacted by: ${reactUsers.map(r => r.name).join(', ')}`
                            return (
                              <div
                                key={emoji}
                                title={tooltipText}
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (userReacted) {
                                    await removeReaction(msg.id)
                                  } else {
                                    await reactToMessage({ messageId: msg.id, emoji })
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold cursor-pointer transition-all shadow-sm select-none",
                                  userReacted
                                    ? "bg-primary-soft/60 border-primary/20 text-primary"
                                    : "bg-card border-border/20 text-foreground hover:bg-muted-light"
                                )}
                              >
                                <Emoji unified={getEmojiUnified(emoji)} emojiStyle={EmojiStyle.APPLE} size={12} />
                                <span>{reactUsers.length}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Hover Dropdown & Reply Actions */}
                    <div className="flex items-center gap-1 self-center shrink-0">
                      {/* Quick Reply */}
                      {!msg.isDeleted && !isMultiSelectMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReply(msg, isMe)
                          }}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150',
                            'bg-muted/60 hover:bg-primary/10 text-muted-dark hover:text-primary border border-border/30',
                            isHovered
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-75 pointer-events-none',
                          )}
                          title="Reply"
                        >
                          <Reply size={12} strokeWidth={2.5} />
                        </Button>
                      )}

                      {/* Context Dropdown Menu */}
                      {!isMultiSelectMode && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150',
                                'bg-muted/60 hover:bg-primary/10 text-muted-dark hover:text-primary border border-border/30',
                                isHovered
                                  ? 'opacity-100 scale-100'
                                  : 'opacity-0 scale-75 pointer-events-none',
                              )}
                              title="Message Actions"
                            >
                              <MoreVertical size={12} strokeWidth={2.5} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align={isMe ? 'end' : 'start'}
                            className="rounded-xl border border-border/30 shadow-lg min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => handleReply(msg, isMe)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Reply size={12} /> Reply
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => handleCopyText(msgText)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Copy size={12} /> Copy
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveReactMsgId(msg.id)
                                }}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Smile size={12} /> React
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={async () => await toggleStarMessage(msg.id)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Star size={12} className={isStarred ? "text-amber-500 fill-amber-500" : ""} />
                                {isStarred ? 'Unstar Message' : 'Star Message'}
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={async () => await togglePinMessage(msg.id)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Pin size={12} className="rotate-45" />
                                {isPinned ? 'Unpin Message' : 'Pin Message'}
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => handleOpenForward(msg.id)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Forward size={12} /> Forward
                              </DropdownMenuItem>
                            )}
                            {isMe && !msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMsgId(msg.id)
                                  setEditingText(msgText)
                                }}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Edit3 size={12} /> Edit
                              </DropdownMenuItem>
                            )}
                            {isMe && (
                              <DropdownMenuItem
                                onClick={() => handleOpenInfo(msg)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                              >
                                <Info size={12} /> Info
                              </DropdownMenuItem>
                            )}
                            {!msg.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(msg.id)}
                                className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 size={12} /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
      <div className={cn('border-t border-border/30 bg-card shrink-0')}>
        {/* Reply Preview Bar */}
        {replyTarget && (
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2.5',
              'bg-primary/5 border-b border-primary/10',
              'animate-in slide-in-from-bottom-1 duration-150',
            )}
          >
            <CornerUpLeft size={13} className="text-primary shrink-0" />
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
                  <X size={14} className="text-white" strokeWidth={2.5} />
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
            disabled={!isConnected || pendingFiles.length >= 5}
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
              pendingFiles.length > 0 && 'text-primary bg-primary-soft/40',
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
              disabled={!isConnected}
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
                  emojiStyle={EmojiStyle.APPLE}
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

      {/* Dialogue windows */}
      <ForwardDialog
        open={showForwardDialog}
        onOpenChange={setShowForwardDialog}
        messageId={forwardTargetId}
        conversations={conversations}
        onForward={(messageId, targetConversationIds) =>
          forwardMessage({ messageId, targetConversationIds })
        }
      />

      <MessageInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        message={infoTargetMsg}
      />

      <MediaBrowserDialog
        open={showMediaBrowser}
        onOpenChange={setShowMediaBrowser}
        messages={messages}
      />

      <Dialog open={!!fullReactMsgId} onOpenChange={(open) => !open && setFullReactMsgId(null)}>
        <DialogContent className="max-w-[350px] rounded-3xl p-0 border border-border/30 shadow-2xl overflow-hidden bg-card flex justify-center items-center">
          <EmojiPicker
            onEmojiClick={async (emojiData) => {
              if (fullReactMsgId) {
                const targetMsg = messages.find((m) => m.id === fullReactMsgId)
                const userReacted = targetMsg?.reactions?.some(
                  (r) => r.userId === currentUserId && r.emoji === emojiData.emoji,
                )
                try {
                  if (userReacted) {
                    await removeReaction(fullReactMsgId)
                  } else {
                    await reactToMessage({ messageId: fullReactMsgId, emoji: emojiData.emoji })
                  }
                } catch (err) {
                  console.error('Failed to react:', err)
                }
                setFullReactMsgId(null)
              }
            }}
            width={320}
            height={360}
            previewConfig={{ showPreview: false }}
            searchDisabled={false}
            skinTonesDisabled={true}
            emojiStyle={EmojiStyle.APPLE}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-xs rounded-3xl p-5 border border-border/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-black text-foreground text-center">
              Delete Message?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2.5 mt-3">
            <Button
              onClick={() => handleDeleteConfirm('me')}
              className="w-full text-[11px] font-bold h-9 rounded-xl border border-border/30 hover:bg-muted-light cursor-pointer shadow-none"
              variant="ghost"
            >
              Delete for me
            </Button>
            {canDeleteForEveryone && (
              <Button
                onClick={() => handleDeleteConfirm('everyone')}
                className="w-full text-[11px] font-bold h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer shadow-sm"
              >
                Delete for everyone
              </Button>
            )}
            <Button
              onClick={() => setShowDeleteDialog(false)}
              className="w-full text-[11px] font-bold h-9 hover:bg-muted/40 cursor-pointer shadow-none text-muted-dark"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {activeConversation && (
        <ReusableAlertDialog
          isOpen={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          onConfirm={async () => {
            try {
              await onClearChat(activeConversation.id)
              toast.success('Chat cleared')
            } catch {
              toast.error('Failed to clear chat')
            } finally {
              setShowClearConfirm(false)
            }
          }}
          title="Clear Chat?"
          description="Are you sure you want to clear this chat? This action cannot be undone."
          confirmText="Clear"
          variant="danger"
        />
      )}
    </div>
  )
}
