import * as LucideIcons from 'lucide-react'
import { Folder } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useState } from 'react'

interface CategoryIconProps {
  category: {
    name: string
    icon?: string
    image?: string
    color?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function CategoryIcon({
  category,
  size = 'md',
  className,
}: CategoryIconProps) {
  const [imageError, setImageError] = useState(false)
  const IconComponent = (LucideIcons as any)[category.icon || 'Folder']
  const iconColor = category.color || 'var(--color-primary)'

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
    xl: 'w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-2xl sm:rounded-3xl',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }

  const showImage = category.image && !imageError

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 overflow-hidden transition-all shadow-sm',
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: showImage ? undefined : `${iconColor}10`,
        color: iconColor,
      }}
    >
      {showImage ? (
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : IconComponent ? (
        <IconComponent size={iconSizes[size]} />
      ) : (
        <Folder size={iconSizes[size]} />
      )}
    </div>
  )
}
