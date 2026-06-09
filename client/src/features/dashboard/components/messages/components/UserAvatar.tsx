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
  size?: 'sm' | 'md'
}

export function UserAvatar({
  image,
  name,
  isOnline,
  size = 'md',
}: UserAvatarProps) {
  const dim = size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-11 h-11 text-xs'
  const dotSize =
    size === 'sm' ? 'w-2.5 h-2.5 border-[2px]' : 'w-3 h-3 border-[2.5px]'
  const radius = size === 'sm' ? 'rounded-lg' : 'rounded-xl'

  return (
    <div className={cn('relative', 'shrink-0')}>
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
            'bg-primary/10 flex items-center justify-center font-black text-primary',
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <div
          className={cn(
            dotSize,
            'absolute -bottom-0.5 -right-0.5 rounded-full border-card',
            isOnline ? 'bg-emerald-500' : 'bg-muted-dark/20',
          )}
        />
      )}
    </div>
  )
}
