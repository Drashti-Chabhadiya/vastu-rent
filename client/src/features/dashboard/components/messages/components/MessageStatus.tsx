import { Star, Pin, CheckCheck, Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatMsgTime } from '#/lib/chat-utils'

interface MessageStatusProps {
  msg: any
  isMe: boolean
  isStarred: boolean
  /** Force white text — used when rendered over a dark image overlay */
  forceWhite?: boolean
}

export function MessageStatus({
  msg,
  isMe,
  isStarred,
  forceWhite,
}: MessageStatusProps) {
  const textColor = forceWhite
    ? 'text-white/90'
    : isMe
      ? 'text-white/60'
      : 'text-muted-dark/60'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[9px] select-none whitespace-nowrap shrink-0 self-end mt-1',
        textColor,
      )}
    >
      {formatMsgTime(msg.createdAt)}
      {isStarred && (
        <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
      )}
      {msg.pinnedBy && msg.pinnedBy.length > 0 && (
        <Pin
          size={9}
          className={cn(
            'rotate-45 shrink-0',
            forceWhite
              ? 'text-white/80'
              : isMe
                ? 'text-white/70'
                : 'text-primary',
          )}
        />
      )}
      {msg.isEdited && !msg.isDeleted && (
        <span
          className={cn(
            'text-[9px] font-bold italic',
            forceWhite
              ? 'text-white/80'
              : isMe
                ? 'text-white/60'
                : 'text-muted-dark/65',
          )}
        >
          edited
        </span>
      )}
      {isMe &&
        !msg.isDeleted &&
        (msg.isRead || !!msg.readAt ? (
          <CheckCheck
            size={11}
            className={forceWhite ? 'text-blue-400' : 'text-blue-400'}
            strokeWidth={2.5}
          />
        ) : msg.deliveredAt ? (
          <CheckCheck
            size={11}
            className={forceWhite ? 'text-white/70' : 'text-white/50'}
            strokeWidth={2.5}
          />
        ) : (
          <Check
            size={11}
            className={forceWhite ? 'text-white/80' : 'text-white/60'}
            strokeWidth={2.5}
          />
        ))}
    </span>
  )
}
