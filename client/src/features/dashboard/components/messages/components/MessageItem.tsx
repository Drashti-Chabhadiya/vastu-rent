import { useRef } from 'react'
import {
  X,
  CheckSquare,
  Square,
  Reply,
  ArrowRightLeft,
  ZoomIn,
  ImagePlus,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { UserAvatar } from './UserAvatar'
import { VoicePlayer } from './VoicePlayer'
import { FileAttachment } from './FileAttachment'
import {
  parseMessage,
  formatMsgTime,
  isImageUrl,
  isAudioUrl,
  highlightText,
} from '#/lib/chat-utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'
import { useSessionContext } from '#/context/SessionContext'
import { MessageReactions } from './MessageReactions'
import { MessageStatus } from './MessageStatus'
import { MessageActions } from './MessageActions'

interface MessageItemProps {
  msg: any
}

export function MessageItem({ msg }: MessageItemProps) {
  const { data: session } = useSessionContext()
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

  const { replyQuote, replyToId, text: msgText } = parseMessage(msg.content)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setActiveReactMsgId(msg.id)
      setHoveredMsgId(msg.id)
      if (
        typeof window !== 'undefined' &&
        window.navigator &&
        window.navigator.vibrate
      ) {
        window.navigator.vibrate(50)
      }
    }, 450)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

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

  let replySenderName = 'Someone'
  if (replyToId) {
    const originalMsg = messages.find((m: any) => m.id === replyToId)
    if (originalMsg) {
      replySenderName =
        originalMsg.senderId === currentUserId
          ? 'You'
          : (activeConversation?.otherParticipant.name ?? 'Them')
    } else {
      replySenderName = 'Previous message'
    }
  }

  const handleScrollToOriginal = () => {
    if (!replyToId) return
    const el = document.getElementById(`msg-${replyToId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-primary/20', 'transition-colors', 'duration-500')
      setTimeout(() => {
        el.classList.remove('bg-primary/20')
      }, 1500)
    }
  }

  const handleReplyInternal = (m: any, me: boolean) => {
    const { text } = parseMessage(m.content)
    const senderName = me
      ? 'You'
      : (activeConversation?.otherParticipant.name ?? 'Them')
    setReplyTarget({
      id: m.id,
      replyToId: m.id,
      content: text,
      senderName,
      isMe: me,
      attachments: m.attachments,
    })
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
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

                    {/* Media-only Time and Tick Overlay */}
                    {!msg.content && (
                      <div className="absolute bottom-1.5 right-1.5 z-10 bg-black/40 px-2 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                        <div className="-mt-1">
                          <MessageStatus
                            msg={msg}
                            isMe={isMe}
                            isStarred={isStarred}
                            forceWhite={true}
                          />
                        </div>
                      </div>
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
                ? 'bg-brand-green-bubble/50 border border-brand-green-border rounded-2xl rounded-tr-sm'
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
                ? 'bg-brand-green-bubble border border-brand-green-border text-foreground rounded-2xl rounded-tr-sm'
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
                  className="h-6 px-2.5 text-[9px] font-black text-white bg-primary hover:bg-primary/95 rounded-md shadow-sm cursor-pointer"
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
                'px-4 py-2.5 text-[12px] font-semibold leading-relaxed relative rounded-xl shadow-none border max-w-md flex flex-col',
                isMe
                  ? 'bg-primary border-transparent text-white rounded-tr-xs'
                  : 'bg-white dark:bg-card text-foreground/90 border-border/15 rounded-tl-xs',
              )}
            >
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

              {/* Quoted reply block — dictates minimum width of the bubble */}
              {replyQuote && (
                <div
                  role="button"
                  tabIndex={replyToId ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleScrollToOriginal()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleScrollToOriginal()
                    }
                  }}
                  className={cn(
                    'relative w-full mb-1.5 rounded-lg overflow-hidden transition-opacity duration-100',
                    replyToId
                      ? 'cursor-pointer active:opacity-80'
                      : 'cursor-default',
                    isMe ? 'bg-black/20' : 'bg-black/5',
                  )}
                >
                  {/* Straight colored indicator line on the left */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 bottom-0 w-1',
                      isMe ? 'bg-white/70' : 'bg-primary',
                    )}
                  />

                  <div className="pl-3.5 pr-2.5 py-1.5 flex flex-col gap-0.5">
                    {/* Sender name */}
                    <span
                      className={cn(
                        'text-[10.5px] font-extrabold truncate w-full',
                        isMe ? 'text-white/90' : 'text-primary',
                      )}
                    >
                      {replySenderName}
                    </span>
                    {/* Quoted text — single line */}
                    <p
                      className={cn(
                        'text-[10px] font-medium leading-snug truncate w-full',
                        isMe ? 'text-white/75' : 'text-foreground/60',
                      )}
                    >
                      {replyQuote}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-3 w-full">
                <div className="break-words min-w-[60px] max-w-full">
                  <span>{highlightText(msgText, searchText)}</span>
                </div>

                <div className="shrink-0 ml-auto self-end flex items-center h-full relative top-0.5">
                  <MessageStatus msg={msg} isMe={isMe} isStarred={isStarred} />
                </div>
              </div>
            </div>
          )
        )}

        <MessageReactions
          msg={msg}
          isMe={isMe}
          isHovered={isHovered}
          activeReactMsgId={activeReactMsgId}
          isMultiSelectMode={isMultiSelectMode}
          currentUserId={currentUserId}
          removeReaction={removeReaction}
          reactToMessage={reactToMessage}
          setActiveReactMsgId={setActiveReactMsgId}
          setFullReactMsgId={setFullReactMsgId}
        />
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
          <MessageActions
            msg={msg}
            isMe={isMe}
            isHovered={isHovered}
            isStarred={isStarred}
            isPinned={isPinned}
            msgText={msgText}
            handleReplyInternal={handleReplyInternal}
            handleCopyTextInternal={handleCopyTextInternal}
            handleOpenDeleteInternal={handleOpenDeleteInternal}
            handleOpenForwardInternal={handleOpenForwardInternal}
            handleOpenInfoInternal={handleOpenInfoInternal}
            setActiveReactMsgId={setActiveReactMsgId}
            setEditingMsgId={setEditingMsgId}
            setEditingText={setEditingText}
            toggleStarMessage={toggleStarMessage}
            togglePinMessage={togglePinMessage}
          />
        )}
      </div>
    </div>
  )
}
