import { Button } from '#/components/ui/button'
import { Pin, X } from 'lucide-react'
import { parseMessage } from '#/lib/chat-utils'

interface PinnedMessageBannerProps {
  activePinnedMessage: any
  togglePinMessage: (id: string) => Promise<void>
  scrollToMessage: (id: string) => void
}

export function PinnedMessageBanner({
  activePinnedMessage,
  togglePinMessage,
  scrollToMessage,
}: PinnedMessageBannerProps) {
  return (
    <div className="bg-[#f4f9f3] border-b border-[#dcebd8] px-6 py-3 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-200">
      <div
        onClick={() => scrollToMessage(activePinnedMessage.id)}
        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 hover:opacity-90"
      >
        <Pin size={14} className="text-emerald-600 fill-emerald-600 rotate-45 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-emerald-700">
            Pinned message
          </p>
          <p className="text-[11px] text-muted-dark mt-0.5 truncate">
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
        className="w-6 h-6 rounded-full hover:bg-muted-light/60 text-muted-dark hover:text-foreground cursor-pointer shrink-0"
        title="Unpin message"
      >
        <X size={14} />
      </Button>
    </div>
  )
}
