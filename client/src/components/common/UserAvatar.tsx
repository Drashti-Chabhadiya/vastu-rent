import { cn } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  const first = parts[0]?.charAt(0) || ''
  const isLower = name === name.toLowerCase()
  return isLower ? first.toLowerCase() : first.toUpperCase()
}

const AVATAR_COLORS = [
  'bg-primary-soft text-primary',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export interface UserAvatarProps {
  image?: string | null
  name?: string
  isOnline?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'trigger' | 'sidebar' | 'sidebar-large'
  shape?: 'circle' | 'square'
  showPing?: boolean
  className?: string
  avatarClassName?: string
  fallbackClassName?: string
}

export function UserAvatar({
  image,
  name = 'User',
  isOnline,
  size = 'md',
  shape = 'circle',
  showPing = true,
  className,
  avatarClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const dim =
    size === 'sm'
      ? 'w-8 h-8 text-[10px]'
      : size === 'trigger'
        ? 'w-9 h-9 text-xs'
        : size === 'sidebar'
          ? 'w-10 h-10 text-xs'
          : size === 'md'
            ? 'w-11 h-11 text-xs'
            : size === 'lg'
              ? 'w-12 h-12 text-sm'
              : size === 'sidebar-large'
                ? 'w-14 h-14 text-base'
                : 'w-32 h-32 md:w-40 md:h-40 text-4xl'

  const dotSize =
    size === 'sm'
      ? 'w-2.5 h-2.5 border-[2px]'
      : size === 'xl'
        ? 'w-5 h-5 border-[3px]'
        : size === 'sidebar' || size === 'trigger'
          ? 'w-2.5 h-2.5 border-2'
          : size === 'sidebar-large'
            ? 'w-3.5 h-3.5 border-2'
            : 'w-3 h-3 border-[2.5px]'

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
  const dotPos = size === 'xl' ? 'bottom-2 right-2' : '-bottom-0.5 -right-0.5'

  return (
    <div className={cn('relative shrink-0', className)}>
      <Avatar className={cn(dim, radius, avatarClassName)}>
        <AvatarImage src={image || ''} alt={name} className="object-cover" />
        <AvatarFallback
          className={cn(
            // 'bg-primary-soft text-primary font-bold',
            getAvatarColor(name),
            'font-bold',
            size === 'xl' ? 'font-black text-4xl' : '',
            fallbackClassName,
          )}
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute rounded-full border-card shadow-sm',
            dotSize,
            dotPos,
            isOnline ? 'bg-primary' : 'bg-muted-dark/20',
          )}
        >
          {isOnline && showPing && (
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          )}
        </span>
      )}
    </div>
  )
}
