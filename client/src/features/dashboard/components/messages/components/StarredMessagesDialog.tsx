import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../store/useChatStore'

interface StarredMessagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StarredMessagesDialog({
  open,
  onOpenChange,
}: StarredMessagesDialogProps) {
  const { messages, currentUserId } = useChatStore()

  const starredMessages = messages.filter(
    (m) => !m.isDeleted && m.starredBy?.includes(currentUserId || ''),
  )

  const handleScrollToMsg = (msgId: string) => {
    window.dispatchEvent(
      new CustomEvent('scroll-to-chat-msg', { detail: { messageId: msgId } }),
    )
    toast.success('Scrolled to message')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl bg-card max-h-[70vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-border/20">
          <DialogTitle className="text-[15px] font-black text-slate-800 flex items-center gap-2">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            Starred Messages ({starredMessages.length})
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 scrollbar-thin min-h-[150px]">
          {starredMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[11px] font-bold">
              No starred messages in this conversation.
            </div>
          ) : (
            starredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleScrollToMsg(msg.id)}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 cursor-pointer transition-colors space-y-1"
                title="Click to view message in chat"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>{msg.sender.name}</span>
                  <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                </div>
                <p className="text-[12px] text-slate-700 font-bold leading-normal break-words">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
