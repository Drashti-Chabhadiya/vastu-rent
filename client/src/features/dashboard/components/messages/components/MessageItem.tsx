import { Emoji, EmojiStyle } from 'emoji-picker-react'
import {
  X,
  CheckSquare,
  Square,
  Reply,
  MoreVertical,
  Copy,
  Smile,
  Star,
  Pin,
  Forward,
  Edit3,
  Info,
  Trash2,
  ArrowRightLeft,
  CornerUpLeft,
  ZoomIn,
  CheckCheck,
  Check,
  ImagePlus,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'
import { UserAvatar } from './UserAvatar'
import { VoicePlayer } from './VoicePlayer'
import { FileAttachment } from './FileAttachment'
import {
  parseMessage,
  formatMsgTime,
  getEmojiUnified,
  isImageUrl,
  isAudioUrl,
  highlightText,
} from '#/lib/chat-utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth/auth-client'

interface MessageItemProps {
  msg: any
}

export function MessageItem({ msg }: MessageItemProps) {
  const { data: session } = authClient.useSession()
  const {
    currentUserId,
    removeReaction,
    reactToMessage,
    openLightbox,
    toggleStarMessage,
    togglePinMessage,
    editMessage,
    messages,
    isMultiSelectMode,
    selectedMsgIds,
    setSelectedMsgIds,
    hoveredMsgId,
    setHoveredMsgId,
    activeReactMsgId,
    setActiveReactMsgId,
    setFullReactMsgId,
    hideMedia,
    revealedMediaMsgs,
    setRevealedMediaMsgs,
    editingMsgId,
    setEditingMsgId,
    editingText,
    setEditingText,
    searchText,
    setReplyTarget,
    conversations,
    activeConversationId,
    setDeleteTargetId,
    setCanDeleteForEveryone,
    setShowDeleteDialog,
    setForwardTargetId,
    setShowForwardDialog,
    setInfoTargetMsg,
    setShowInfoDialog,
  } = useChatStore()

  const { replyQuote, text: msgText } = parseMessage(msg.content)
  const isHovered = hoveredMsgId === msg.id
  const isStarred = msg.starredBy?.includes(currentUserId || '')
  const isPinned = msg.pinnedBy?.includes(currentUserId || '')

  const handleSelectMessage = (msgId: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(msgId)
        ? prev.filter((id) => id !== msgId)
        : [...prev, msgId],
    )
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )
  const otherParticipant = activeConversation?.otherParticipant || {
    name: 'Them',
    image: '',
  }
  const isMe = msg.senderId === currentUserId

  const handleReplyInternal = (m: any, me: boolean) => {
    const { text } = parseMessage(m.content)
    const senderName = me
      ? 'You'
      : (activeConversation?.otherParticipant.name ?? 'Them')
    setReplyTarget({ id: m.id, content: text, senderName, isMe: me })
    setTimeout(() => {
      document.querySelector('input')?.focus()
    }, 50)
  }

  const handleUpdateMessageInternal = async (msgId: string) => {
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

  const handleCopyTextInternal = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Message text copied to clipboard!')
  }

  const handleOpenDeleteInternal = (msgId: string) => {
    setDeleteTargetId(msgId)
    const m = messages.find((x) => x.id === msgId)
    if (m) {
      const fifteenMinutes = 15 * 60 * 1000
      const isWithinTimeLimit =
        Date.now() - new Date(m.createdAt).getTime() < fifteenMinutes
      const isSender = m.senderId === currentUserId
      const isAdmin = session?.user?.role === 'admin'
      setCanDeleteForEveryone((isSender && isWithinTimeLimit) || isAdmin)
    }
    setShowDeleteDialog(true)
  }

  const handleOpenForwardInternal = (msgId: string) => {
    setForwardTargetId(msgId)
    setShowForwardDialog(true)
  }

  const handleOpenInfoInternal = (m: any) => {
    setInfoTargetMsg(m)
    setShowInfoDialog(true)
  }

  return (
    <div
      id={`msg-${msg.id}`}
      onClick={
        isMultiSelectMode ? () => handleSelectMessage(msg.id) : undefined
      }
      className={cn(
        'flex gap-2.5 group/msg relative p-1.5 rounded-2xl transition-all',
        isMultiSelectMode && 'cursor-pointer hover:bg-muted-light/45',
        selectedMsgIds.includes(msg.id) &&
          'bg-primary-soft/50 border border-primary-border/20 shadow-sm',
        isMe ? 'flex-row-reverse ml-auto max-w-[82%]' : 'mr-auto max-w-[82%]',
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
      {!msg.isDeleted &&
        (isHovered || activeReactMsgId === msg.id) &&
        !isMultiSelectMode && (
          <div
            className={cn(
              'flex items-center gap-1.5 bg-card border border-border/30 shadow-md rounded-full px-2 py-1.5 absolute -top-8 z-20 animate-in zoom-in-95 duration-100',
              isMe ? 'right-2' : 'left-10',
            )}
          >
            {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => {
              const userReacted = msg.reactions?.some(
                (r: any) => r.userId === currentUserId && r.emoji === emoji,
              )
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
                    'hover:scale-125 transition-transform duration-100 p-1 cursor-pointer hover:drop-shadow-sm flex items-center justify-center rounded-full',
                    userReacted && 'bg-primary/10',
                  )}
                >
                  <Emoji
                    unified={getEmojiUnified(emoji)}
                    emojiStyle={EmojiStyle.APPLE}
                    size={18}
                  />
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
            image={otherParticipant.image}
            name={otherParticipant.name}
            size="sm"
          />
        </div>
      )}

      <div className={cn('flex flex-col gap-1 min-w-0')}>
        {/* Attachments rendering */}
        {!msg.isDeleted &&
          msg.attachments &&
          msg.attachments.length > 0 &&
          (() => {
            const imageAttachments = msg.attachments.filter(isImageUrl)
            const audioAttachments = msg.attachments.filter(isAudioUrl)
            const docAttachments = msg.attachments.filter(
              (url: string) => !isImageUrl(url) && !isAudioUrl(url),
            )

            return (
              <div className="flex flex-col gap-1.5">
                {/* Image attachments grid */}
                {imageAttachments.length > 0 && (
                  <div
                    className={cn(
                      'grid gap-1.5 rounded-2xl overflow-hidden shadow-sm relative border border-border/10',
                      imageAttachments.length === 1
                        ? 'grid-cols-1 max-w-[220px]'
                        : imageAttachments.length === 2
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
                          setRevealedMediaMsgs((prev) => [...prev, msg.id])
                        }}
                        className="w-full h-24 bg-muted-light flex flex-col items-center justify-center p-3 text-center border border-border/20 gap-1.5 cursor-pointer outline-none hover:bg-muted-light/85 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center text-muted-dark shadow-sm">
                          <ImagePlus size={14} />
                        </div>
                        <span className="text-[9px] font-bold text-muted-dark">
                          Media hidden
                        </span>
                        <span className="text-[8px] font-medium text-muted-dark/70">
                          Click to view
                        </span>
                      </button>
                    ) : (
                      imageAttachments.map((src: string, i: number) => (
                        <Button
                          key={i}
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            openLightbox(imageAttachments, i)
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

                {/* Audio attachments */}
                {audioAttachments.map((src: string, idx: number) => (
                  <VoicePlayer
                    key={`audio-${idx}`}
                    src={src}
                    timeStr={formatMsgTime(msg.createdAt)}
                  />
                ))}

                {/* Document attachments */}
                {docAttachments.map((src: string, idx: number) => (
                  <FileAttachment key={`doc-${idx}`} src={src} />
                ))}
              </div>
            )
          })()}

        {/* Bubble */}
        {msg.isDeleted ? (
          <div
            className={cn(
              'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative italic text-muted-dark/70 flex items-center gap-1.5',
              isMe
                ? 'bg-[#eef6ec]/50 border border-[#dcebd8] rounded-2xl rounded-tr-sm'
                : 'bg-muted/45 border border-border/20 rounded-2xl rounded-tl-sm',
            )}
          >
            <span className="opacity-60 shrink-0">
              <X size={11} strokeWidth={3} />
            </span>
            This message was deleted
          </div>
        ) : editingMsgId === msg.id ? (
          <div
            className={cn(
              'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm relative',
              isMe
                ? 'bg-[#eef6ec] border border-[#dcebd8] text-foreground rounded-2xl rounded-tr-sm'
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
                  onClick={() => handleUpdateMessageInternal(msg.id)}
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
                'px-4 py-2.5 text-[12px] font-semibold leading-relaxed relative rounded-2xl shadow-none border max-w-md flex flex-wrap items-baseline justify-between gap-3',
                isMe
                  ? 'bg-[#eef6ec] border-[#dcebd8] text-foreground rounded-tr-sm'
                  : 'bg-white border-slate-200/80 text-foreground rounded-tl-sm',
              )}
            >
              <div className="flex-1 break-words min-w-[60px]">
                {/* Forwarded label */}
                {msg.isForwarded && (
                  <div className="flex items-center gap-1 text-[8.5px] font-black text-muted-dark/85 uppercase tracking-wider mb-1">
                    <ArrowRightLeft
                      size={9}
                      strokeWidth={3.5}
                      className="text-muted-dark/75"
                    />
                    Forwarded
                  </div>
                )}

                {/* Quoted reply block */}
                {replyQuote && (
                  <div
                    className={cn(
                      'flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded-lg text-[10px]',
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

                <span>{highlightText(msgText, searchText)}</span>
              </div>

              {/* Inline Time + Read receipts */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[9px] text-muted-dark/60 select-none whitespace-nowrap shrink-0 self-end mt-1',
                )}
              >
                {formatMsgTime(msg.createdAt)}
                {isStarred && (
                  <Star
                    size={9}
                    className="text-amber-500 fill-amber-500 shrink-0"
                  />
                )}
                {msg.pinnedBy && msg.pinnedBy.length > 0 && (
                  <Pin size={9} className="text-primary rotate-45 shrink-0" />
                )}
                {msg.isEdited && !msg.isDeleted && (
                  <span className="text-[9px] font-bold text-muted-dark/65 italic">
                    edited
                  </span>
                )}
                {isMe &&
                  !msg.isDeleted &&
                  (msg.isRead || !!msg.readAt ? (
                    <CheckCheck
                      size={11}
                      className="text-emerald-500 fill-transparent"
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
              </span>
            </div>
          )
        )}

        {/* Reaction badges */}
        {!msg.isDeleted && msg.reactions && msg.reactions.length > 0 && (
          <div
            className={cn(
              'flex flex-wrap gap-1 mt-1',
              isMe ? 'justify-end' : 'justify-start',
            )}
          >
            {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map(
              (emoji: any) => {
                const reactUsers = msg.reactions!.filter(
                  (r: any) => r.emoji === emoji,
                )
                const userReacted = reactUsers.some(
                  (r: any) => r.userId === currentUserId,
                )
                const tooltipText = `Reacted by: ${reactUsers.map((r: any) => r.name).join(', ')}`
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
                      'flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer transition-all shadow-sm select-none',
                      userReacted
                        ? 'bg-[#eef6ec] border-[#dcebd8] text-emerald-800'
                        : 'bg-white border-slate-200/80 text-foreground hover:bg-slate-50',
                    )}
                  >
                    <Emoji
                      unified={getEmojiUnified(emoji)}
                      emojiStyle={EmojiStyle.APPLE}
                      size={12}
                    />
                    <span>{reactUsers.length}</span>
                  </div>
                )
              },
            )}
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
              handleReplyInternal(msg, isMe)
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
                  onClick={() => handleReplyInternal(msg, isMe)}
                  className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                >
                  <Reply size={12} /> Reply
                </DropdownMenuItem>
              )}
              {!msg.isDeleted && (
                <DropdownMenuItem
                  onClick={() => handleCopyTextInternal(msgText)}
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
                  <Star
                    size={12}
                    className={isStarred ? 'text-amber-500 fill-amber-500' : ''}
                  />
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
                  onClick={() => handleOpenForwardInternal(msg.id)}
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
                  onClick={() => handleOpenInfoInternal(msg)}
                  className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-foreground/90"
                >
                  <Info size={12} /> Info
                </DropdownMenuItem>
              )}
              {!msg.isDeleted && (
                <DropdownMenuItem
                  onClick={() => handleOpenDeleteInternal(msg.id)}
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
}
