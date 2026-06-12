import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Search, Send, Check, Loader2, ArrowRightLeft } from 'lucide-react'
import { cn } from '#/lib/utils'
import { UserAvatar } from './UserAvatar'
import type { Conversation } from '../../../../../hook/use-chat'
import { toast } from 'sonner'

interface ForwardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string | string[] | null
  conversations: Conversation[]
  onForward: (messageId: string, targetConversationIds: string[]) => Promise<any>
}

export function ForwardDialog({
  open,
  onOpenChange,
  messageId,
  conversations,
  onForward,
}: ForwardDialogProps) {
  const [search, setSearch] = useState('')
  const [forwardingIds, setForwardingIds] = useState<Record<string, 'loading' | 'success'>>({})

  // Filter conversations matching search query
  const filtered = conversations.filter((c) =>
    c.otherParticipant.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleForwardTo = async (convId: string, name: string) => {
    if (!messageId) return

    setForwardingIds((prev) => ({ ...prev, [convId]: 'loading' }))
    try {
      if (Array.isArray(messageId)) {
        await Promise.all(messageId.map((id) => onForward(id, [convId])))
      } else {
        await onForward(messageId, [convId])
      }
      setForwardingIds((prev) => ({ ...prev, [convId]: 'success' }))
      toast.success(`Forwarded to ${name}`)
    } catch (err: any) {
      setForwardingIds((prev) => {
        const updated = { ...prev }
        delete updated[convId]
        return updated
      })
      toast.error(err?.response?.data?.message || 'Failed to forward')
    }
  }

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
            <ArrowRightLeft size={18} className="text-primary" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className={cn('px-4', 'pt-4')}>
          <div className="relative">
            <Search
              size={13}
              className={cn(
                'absolute',
                'left-3',
                'top-[13px]',
                'text-muted-dark',
              )}
            />
            <Input
              placeholder="Search chat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'h-10',
                'pl-9',
                'bg-muted-light',
                'border-none',
                'rounded-xl',
                'text-[11px]',
                'font-bold',
                'focus-visible:ring-1',
                'focus-visible:ring-primary/20',
              )}
            />
          </div>
        </div>

        {/* List of active conversations */}
        <div
          className={cn(
            'px-4',
            'pb-4',
            'mt-2',
            'max-h-72',
            'overflow-y-auto',
            'space-y-1',
            'scrollbar-thin',
          )}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-[11px] font-bold text-muted-dark">
                No active conversations found
              </p>
            </div>
          ) : (
            filtered.map((conv) => {
              const status = forwardingIds[conv.id]
              return (
                <div
                  key={conv.id}
                  className={cn(
                    'w-full',
                    'flex',
                    'items-center',
                    'gap-3',
                    'p-3',
                    'rounded-2xl',
                    'hover:bg-muted-light',
                    'transition-colors',
                    'justify-between',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <UserAvatar
                      image={conv.otherParticipant.image}
                      name={conv.otherParticipant.name}
                      size="sm"
                    />
                    <div className="min-w-0 text-left">
                      <p className="text-[12px] font-black text-foreground truncate">
                        {conv.otherParticipant.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-dark capitalize">
                        {conv.otherParticipant.role}
                      </p>
                    </div>
                  </div>

                  {status === 'loading' ? (
                    <Button variant="ghost" size="icon" disabled className="w-8 h-8">
                      <Loader2 size={13} className="animate-spin text-primary" />
                    </Button>
                  ) : status === 'success' ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleForwardTo(conv.id, conv.otherParticipant.name)}
                      className="w-8 h-8 rounded-xl bg-primary-soft hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      title="Send forwarded message"
                    >
                      <Send size={12} className="ml-0.5" />
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
