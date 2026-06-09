import { cn } from '#/lib/utils'

export function TypingBubble() {
  return (
    <div className={cn('flex', 'gap-3', 'max-w-[70%]', 'mr-auto')}>
      <div
        className={cn(
          'p-3.5',
          'rounded-2xl',
          'rounded-tl-none',
          'bg-card',
          'border',
          'border-border/30',
          'shadow-sm',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-1.5', 'h-4')}>
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:0ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:150ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-muted-dark',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:300ms]',
            )}
          />
        </div>
      </div>
    </div>
  )
}
