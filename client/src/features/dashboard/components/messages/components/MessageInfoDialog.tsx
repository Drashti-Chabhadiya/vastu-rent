import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Info, Check, CheckCheck } from 'lucide-react'
import { cn } from '#/lib/utils'
import { parseMessage } from '#/lib/chat-utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { formatFullDate } from '#/lib/date-utils'

export function MessageInfoDialog() {
  const {
    showInfoDialog: open,
    setShowInfoDialog: onOpenChange,
    infoTargetMsg: message,
  } = useChatStore()

  if (!message) return null

  const { text: msgText } = parseMessage(message.content)

  // Determine message status
  const isRead = !!message.readAt || message.isRead
  const isDelivered = !!message.deliveredAt || isRead

  const sentTimeStr = formatFullDate(message.createdAt)
  const deliveredTimeStr = formatFullDate(message.deliveredAt)
  const readTimeStr = formatFullDate(message.readAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          className={cn('px-6', 'pt-6', 'pb-4', 'border-b', 'border-border/30')}
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
            <Info size={18} className="text-primary" />
            Message Info
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Message Content Bubble Preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-muted-dark uppercase tracking-wider">
              Message content
            </span>
            <div className="bg-muted-light/35 border border-border/20 rounded-2xl p-4 text-[11.5px] font-semibold text-foreground/80 leading-relaxed break-words">
              {msgText}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 text-[9px] font-bold text-primary flex items-center gap-1">
                  📎 Contains {message.attachments.length} image attachment(s)
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-muted-dark uppercase tracking-wider block">
              Delivery status
            </span>

            <div className="relative border-l border-border/30 ml-3.5 pl-6 space-y-5 py-1">
              {/* READ STATE */}
              <div className="relative">
                <div
                  className={cn(
                    'absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-colors',
                    isRead
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-muted border-border/40 text-muted-dark/40',
                  )}
                >
                  <CheckCheck size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[11.5px] font-black text-foreground">
                    Read
                  </h4>
                  <p className="text-[9.5px] font-bold text-muted-dark mt-0.5">
                    {isRead && readTimeStr ? readTimeStr : 'Unread'}
                  </p>
                </div>
              </div>

              {/* DELIVERED STATE */}
              <div className="relative">
                <div
                  className={cn(
                    'absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-colors',
                    isDelivered
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-muted border-border/40 text-muted-dark/40',
                  )}
                >
                  <CheckCheck
                    size={12}
                    className={cn(
                      !isRead && isDelivered ? 'text-muted-dark' : '',
                    )}
                    strokeWidth={3}
                  />
                </div>
                <div>
                  <h4 className="text-[11.5px] font-black text-foreground">
                    Delivered
                  </h4>
                  <p className="text-[9.5px] font-bold text-muted-dark mt-0.5">
                    {isDelivered && (deliveredTimeStr || readTimeStr)
                      ? deliveredTimeStr || readTimeStr
                      : 'Pending delivery'}
                  </p>
                </div>
              </div>

              {/* SENT STATE */}
              <div className="relative">
                <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border bg-muted border-border/40 text-muted-dark shadow-sm">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[11.5px] font-black text-foreground">
                    Sent
                  </h4>
                  <p className="text-[9.5px] font-bold text-muted-dark mt-0.5">
                    {sentTimeStr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
