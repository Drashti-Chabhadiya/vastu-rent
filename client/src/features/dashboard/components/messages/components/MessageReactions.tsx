import { Emoji, EmojiStyle } from 'emoji-picker-react'
import { cn } from '#/lib/utils'
import { getEmojiUnified } from '#/lib/chat-utils'

interface MessageReactionsProps {
  msg: any
  isMe: boolean
  isHovered: boolean
  activeReactMsgId: string | null
  isMultiSelectMode: boolean
  currentUserId: string | null | undefined
  removeReaction: (messageId: string) => Promise<any>
  reactToMessage: (params: { messageId: string; emoji: string }) => Promise<any>
  setActiveReactMsgId: (id: string | null) => void
  setFullReactMsgId: (id: string | null) => void
}

export function MessageReactions({
  msg,
  isMe,
  isHovered,
  activeReactMsgId,
  isMultiSelectMode,
  currentUserId,
  removeReaction,
  reactToMessage,
  setActiveReactMsgId,
  setFullReactMsgId,
}: MessageReactionsProps) {
  return (
    <>
      {/* Quick Reactions Bar */}
      {!msg.isDeleted &&
        !isMultiSelectMode &&
        (() => {
          // On touch/mobile: ONLY show when explicitly activated (long press)
          // On desktop: also show on hover
          const isTouchDevice =
            typeof window !== 'undefined' &&
            window.matchMedia('(pointer: coarse)').matches
          const shouldShow =
            activeReactMsgId === msg.id || (!isTouchDevice && isHovered)
          if (!shouldShow) return null
          return (
            <div
              data-reaction-bar
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
          )
        })()}

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
                      ? 'bg-brand-green-bubble border-brand-green-border text-emerald-800'
                      : 'bg-card border-border/80 text-foreground hover:bg-muted-light/30',
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
    </>
  )
}
