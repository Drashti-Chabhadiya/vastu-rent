import {
  Reply,
  Copy,
  Smile,
  Star,
  Pin,
  Forward,
  Edit3,
  Info,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'

interface MessageActionsProps {
  msg: any
  isMe: boolean
  isHovered: boolean
  isStarred: boolean
  isPinned: boolean
  msgText: string
  handleReplyInternal: (m: any, me: boolean) => void
  handleCopyTextInternal: (text: string) => void
  handleOpenDeleteInternal: (msgId: string) => void
  handleOpenForwardInternal: (msgId: string) => void
  handleOpenInfoInternal: (m: any) => void
  setActiveReactMsgId: (id: string | null) => void
  setEditingMsgId: (id: string | null) => void
  setEditingText: (text: string) => void
  toggleStarMessage: (id: string) => Promise<any>
  togglePinMessage: (id: string) => Promise<any>
}

export function MessageActions({
  msg,
  isMe,
  isHovered,
  isStarred,
  isPinned,
  msgText,
  handleReplyInternal,
  handleCopyTextInternal,
  handleOpenDeleteInternal,
  handleOpenForwardInternal,
  handleOpenInfoInternal,
  setActiveReactMsgId,
  setEditingMsgId,
  setEditingText,
  toggleStarMessage,
  togglePinMessage,
}: MessageActionsProps) {
  return (
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
            className="text-[10px] font-bold gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-danger"
          >
            <Trash2 size={12} /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
