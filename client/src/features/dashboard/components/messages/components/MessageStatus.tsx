import { Star, Pin, CheckCheck, Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatMsgTime } from '#/lib/chat-utils'

interface MessageStatusProps {
  msg: any
  isMe: boolean
  isStarred: boolean
}

export function MessageStatus({ msg, isMe, isStarred }: MessageStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[9px] select-none whitespace-nowrap shrink-0 self-end mt-1',
        isMe ? 'text-white/60' : 'text-muted-dark/60',
      )}
    >
      {formatMsgTime(msg.createdAt)}
      {isStarred && (
        <Star size={9} className="text-amber-500 fill-amber-500 shrink-0" />
      )}
      {msg.pinnedBy && msg.pinnedBy.length > 0 && (
        <Pin
          size={9}
          className={cn(
            'rotate-45 shrink-0',
            isMe ? 'text-white/70' : 'text-primary',
          )}
        />
      )}
      {msg.isEdited && !msg.isDeleted && (
        <span
          className={cn(
            'text-[9px] font-bold italic',
            isMe ? 'text-white/60' : 'text-muted-dark/65',
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
            className="text-emerald-300 fill-transparent"
            strokeWidth={2.5}
          />
        ) : msg.deliveredAt ? (
          <CheckCheck
            size={11}
            className="text-white/50 fill-transparent"
            strokeWidth={2.5}
          />
        ) : (
          <Check size={11} className="text-white/60" strokeWidth={2.5} />
        ))}
    </span>
  )
}
