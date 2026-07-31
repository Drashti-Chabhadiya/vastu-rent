import { ArrowLeft, ChevronLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface MobileBackButtonProps {
  onClick?: () => void
  icon?: 'chevron' | 'arrow'
  variant?: 'floating' | 'inline'
  className?: string
}

export function MobileBackButton({
  onClick = () => window.history.back(),
  icon = 'chevron',
  variant = 'floating',
  className,
}: MobileBackButtonProps) {
  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-9 h-9 rounded-full bg-brand-beige/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-brand-beige/75 shrink-0 transition-colors',
          className,
        )}
      >
        {icon === 'arrow' ? (
          <ArrowLeft size={16} strokeWidth={2} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-full bg-card/95 shadow-md hover:bg-card text-foreground backdrop-blur-xs outline-none cursor-pointer',
        className,
      )}
    >
      {icon === 'arrow' ? (
        <ArrowLeft size={18} />
      ) : (
        <ChevronLeft size={22} className="text-foreground" />
      )}
    </Button>
  )
}

interface MobileBackHeaderProps {
  title?: string
  className?: string
}

export function MobileBackHeader({ title, className }: MobileBackHeaderProps) {
  return (
    <div
      className={cn('flex lg:hidden items-center gap-3 mb-4 mt-2', className)}
    >
      <MobileBackButton variant="inline" icon="arrow" />
      {title && (
        <h1 className="text-[17px] font-black text-foreground tracking-tight">
          {title}
        </h1>
      )}
    </div>
  )
}
