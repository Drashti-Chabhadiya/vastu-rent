import { MessageSquare } from 'lucide-react'
import { cn } from '#/lib/utils'

export function MessageEmptyState() {
  return (
    <div
      className={cn(
        'flex-1',
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'text-center',
        'px-8',
      )}
    >
      <div
        className={cn(
          'w-16',
          'h-16',
          'rounded-2xl',
          'bg-primary/10',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <MessageSquare size={28} className="text-primary" fill="currentColor" />
      </div>
      <div>
        <h3 className={cn('text-[13px]', 'font-black', 'text-foreground')}>
          Select a conversation
        </h3>
        <p
          className={cn(
            'text-[11px]',
            'text-muted-dark',
            'font-bold',
            'mt-1',
            'leading-relaxed',
          )}
        >
          Choose a chat from the list or start a new one.
        </p>
      </div>
    </div>
  )
}
