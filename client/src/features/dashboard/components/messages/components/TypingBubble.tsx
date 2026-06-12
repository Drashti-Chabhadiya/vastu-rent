import { cn } from '#/lib/utils'
import { UserAvatar } from './UserAvatar'

interface TypingBubbleProps {
  name: string
  image: string | null
}

export function TypingBubble({ name, image }: TypingBubbleProps) {
  return (
    <div className={cn('flex', 'items-end', 'gap-2.5', 'max-w-[70%]', 'mr-auto', 'my-1')}>
      <div className="shrink-0">
        <UserAvatar
          image={image}
          name={name}
          size="sm"
        />
      </div>
      <div
        className={cn(
          'px-4',
          'py-2.5',
          'rounded-2xl',
          'rounded-tl-none',
          'bg-[#eef6ec]/70',
          'border',
          'border-[#dcebd8]',
          'shadow-none',
          'flex',
          'items-center',
          'gap-2',
        )}
      >
        {/* Animated Bouncing Dots */}
        <div className={cn('flex', 'items-center', 'gap-1', 'h-2')}>
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-emerald-600',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:0ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-emerald-600',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:150ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-emerald-600',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:300ms]',
            )}
          />
        </div>

        {/* Text Label */}
        <span className="text-[11px] font-bold text-emerald-800 select-none lowercase">
          {name} is typing...
        </span>
      </div>
    </div>
  )
}
