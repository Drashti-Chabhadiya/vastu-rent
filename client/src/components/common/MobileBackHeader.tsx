import { ArrowLeft } from 'lucide-react'

interface MobileBackHeaderProps {
  title?: string
}

export function MobileBackHeader({ title }: MobileBackHeaderProps) {
  return (
    <div className="flex lg:hidden items-center gap-3 mb-4 mt-2">
      <button
        onClick={() => window.history.back()}
        className="w-9 h-9 rounded-full bg-brand-beige/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-brand-beige/75 shrink-0 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
      </button>
      {title && (
        <h1 className="text-[17px] font-black text-foreground tracking-tight">{title}</h1>
      )}
    </div>
  )
}
