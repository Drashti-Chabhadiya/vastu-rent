import { cn } from '#/lib/utils'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

interface SettingsSectionShellProps {
  title: string
  description: string
  children: React.ReactNode
}

export function SettingsSectionShell({
  title,
  description,
  children,
}: SettingsSectionShellProps) {
  return (
    <div className={cn('space-y-7', 'max-w-2xl')}>
      <div>
        <MobileBackHeader title={title} />
        <h2
          className={cn(
            'text-base',
            'font-extrabold',
            'text-foreground',
            'hidden lg:block',
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'text-[12px]',
            'text-muted-foreground/70',
            'font-medium',
            'mt-0.5',
          )}
        >
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

interface RowProps {
  label: string
  desc?: string
  last?: boolean
  children: React.ReactNode
}

export function Row({ label, desc, last = false, children }: RowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        !last && 'border-b border-border/30',
      )}
    >
      <div className={cn('min-w-0', 'pr-6')}>
        <p className={cn('text-sm', 'font-semibold', 'text-foreground')}>
          {label}
        </p>
        {desc && (
          <p
            className={cn(
              'text-[12px]',
              'text-muted-foreground/70',
              'font-medium',
              'mt-0.5',
            )}
          >
            {desc}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
