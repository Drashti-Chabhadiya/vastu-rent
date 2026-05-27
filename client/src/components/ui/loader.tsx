import { Loader2 } from 'lucide-react'
import { cn } from '#/lib/utils'

interface LoaderProps {
  className?: string
  size?: number
  variant?: 'default' | 'brand' | 'white' | 'success'
}

export const Loader = ({
  className,
  size = 20,
  variant = 'default',
}: LoaderProps) => {
  return (
    <Loader2
      size={size}
      className={cn(
        'animate-spin shrink-0',
        variant === 'default' && 'text-gray-400',
        variant === 'brand' && 'text-dash-brand',
        variant === 'white' && 'text-white',
        variant === 'success' && 'text-dash-success',
        className,
      )}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export const LoadingOverlay = ({
  message = 'Uploading...',
  className,
}: LoadingOverlayProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl transition-all animate-in fade-in duration-200',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-xl border border-gray-100">
        <Loader variant="brand" size={32} className="stroke-[2.5]" />
        {message && (
          <span className="text-[11px] font-black text-dash-brand uppercase tracking-widest animate-pulse">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
