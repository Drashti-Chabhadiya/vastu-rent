import { cn } from '#/lib/utils'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface UserAvatarProps {
  image: string | null
  name: string
  isOnline?: boolean
  size?: 'sm' | 'md' | 'xl'
  className?: string
}

export function UserAvatar({
  image,
  name,
  isOnline,
  size = 'md',
  className,
}: UserAvatarProps) {
  const dim =
    size === 'sm'
      ? 'w-8 h-8 text-[10px]'
      : size === 'xl'
        ? 'w-32 h-32 md:w-40 md:h-40 text-4xl'
        : 'w-11 h-11 text-xs'
  const dotSize =
    size === 'sm'
      ? 'w-2.5 h-2.5 border-[2px]'
      : size === 'xl'
        ? 'w-5 h-5 border-[3px]'
        : 'w-3 h-3 border-[2.5px]'
  const radius =
    size === 'xl' ? 'rounded-full' : size === 'sm' ? 'rounded-lg' : 'rounded-xl'
  const dotPos = size === 'xl' ? 'bottom-2 right-2' : '-bottom-0.5 -right-0.5'

  return (
    <div className={cn('relative', 'shrink-0', className)}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={cn(dim, radius, 'object-cover')}
        />
      ) : (
        <div
          className={cn(
            dim,
            radius,
            'bg-primary flex items-center justify-center font-black text-primary-foreground',
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <div
          className={cn(
            dotSize,
            'absolute rounded-full border-card',
            dotPos,
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-dark/20',
          )}
        />
      )}
    </div>
  )
}
