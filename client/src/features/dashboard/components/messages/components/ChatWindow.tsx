import { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
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
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { authClient } from '#/lib/auth/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useDeleteConversation } from '#/hook'
import type { Conversation, Message } from '../../../../../hook/use-chat'
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

import { parseMessage, formatMsgTime, formatLastActive } from '#/lib/chat-utils'

interface ChatWindowProps {
  activeConversation: Conversation | null
  checkOnline: (id: string) => boolean
  isOtherPersonTyping: boolean
  isLoadingMessages: boolean
  messages: Message[]
  currentUserId: string | null | undefined
  handleReply: (msg: Message, isMe: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  isConnected: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleSend: () => void
  messagesContainerRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  onCallSuccess?: (name: string) => void
  onVideoSuccess?: (name: string) => void
  editMessage: (params: { messageId: string; content: string }) => Promise<any>
  deleteMessage: (params: { messageId: string; mode: 'me' | 'everyone' }) => Promise<any>
  forwardMessage: (params: { messageId: string; targetConversationIds: string[] }) => Promise<any>
  conversations: Conversation[]
}


export function ChatWindow({
  activeConversation,
  checkOnline,
  isOtherPersonTyping,
  isLoadingMessages,
  messages,
  currentUserId,
  handleReply,
  fileInputRef,
  handleFileSelect,
  isConnected,
  handleInputChange,
  handleKeyDown,
  handleSend,
  messagesContainerRef,
  inputRef,
  onCallSuccess,
  onVideoSuccess,
  editMessage,
  deleteMessage,
  forwardMessage,
  conversations,
}: ChatWindowProps) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false
  const deleteConversation = useDeleteConversation()

  const {
    showMobileChat,
    setShowMobileChat,
    hoveredMsgId,
    setHoveredMsgId,
    openLightbox,
    replyTarget,
    setReplyTarget,
    pendingPreviews,
    pendingFiles,
    removeFile,
    inputText,
    setInputText,
    showEmojiPicker,
    setShowEmojiPicker,
    isUploading,
  } = useChatStore()

  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [canDeleteForEveryone, setCanDeleteForEveryone] = useState(false)

  const [forwardTargetId, setForwardTargetId] = useState<string | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)

  const [infoTargetMsg, setInfoTargetMsg] = useState<Message | null>(null)
  const [showInfoDialog, setShowInfoDialog] = useState(false)

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onCallSuccess?.(activeConversation.otherParticipant.name)
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
              onVideoSuccess?.(activeConversation.otherParticipant.name)
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
                            'grid gap-1.5 rounded-2xl overflow-hidden shadow-sm',
                            msg.attachments.length === 1
                              ? 'grid-cols-1 max-w-[220px]'
                              : msg.attachments.length === 2
                                ? 'grid-cols-2 max-w-[280px]'
                                : 'grid-cols-3 max-w-[320px]',
                            isMe ? 'rounded-tr-sm' : 'rounded-tl-sm',
                          )}
                        >
                          {msg.attachments.map((src, i) => (
                            <Button
                              key={i}
                              type="button"
                              variant="ghost"
                              onClick={() => openLightbox(msg.attachments, i)}
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
                            {msgText}
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
                          )}
                        >
                          {formatMsgTime(msg.createdAt)}
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
                    </div>

                    {/* Hover Dropdown & Reply Actions */}
                    <div className="flex items-center gap-1 self-center shrink-0">
                      {/* Quick Reply */}
                      {!msg.isDeleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReply(msg, isMe)}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                          className="rounded-xl border border-border/30 shadow-lg min-w-[120px]"
                        >
                          {!msg.isDeleted && (
                            <DropdownMenuItem
                              onClick={() => handleReply(msg, isMe)}
                              className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg"
                            >
                              <Reply size={12} /> Reply
                            </DropdownMenuItem>
                          )}
                          {!msg.isDeleted && (
                            <DropdownMenuItem
                              onClick={() => handleCopyText(msgText)}
                              className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg"
                            >
                              <Copy size={12} /> Copy
                            </DropdownMenuItem>
                          )}
                          {!msg.isDeleted && (
                            <DropdownMenuItem
                              onClick={() => handleOpenForward(msg.id)}
                              className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg"
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
                              className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg"
                            >
                              <Edit3 size={12} /> Edit
                            </DropdownMenuItem>
                          )}
                          {isMe && (
                            <DropdownMenuItem
                              onClick={() => handleOpenInfo(msg)}
                              className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg"
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
    </div>
  )
}
