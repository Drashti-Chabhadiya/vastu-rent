import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface NotificationsSummaryCardProps {
  unreadCount: number
  onMarkAllRead: () => void
  isPending: boolean
}

export const NotificationsSummaryCard = ({
  unreadCount,
  onMarkAllRead,
  isPending,
}: NotificationsSummaryCardProps) => {
  const { t, formatNumber } = useTranslation()

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'bg-card',
          'rounded-2xl',
          'border',
          'border-border/30',
          'shadow-sm',
          'p-6',
        )}
      >
        <h3
          className={cn(
            'text-[11px]',
            'font-black',
            'text-foreground',
            'uppercase',
            'tracking-widest',
            'mb-0.5',
          )}
        >
          {t('Account Notifications')}
        </h3>
        <p
          className={cn(
            'text-[10px]',
            'font-semibold',
            'text-muted-dark',
            'mb-5',
          )}
        >
          {t('Unread Alerts')}
        </p>

        <div
          className={cn(
            'flex',
            'items-center',
            'justify-between',
            'py-3',
            'border-b',
            'border-border/30',
          )}
        >
          <div className={cn('flex', 'items-center', 'gap-2.5')}>
            <div
              className={cn(
                'w-7',
                'h-7',
                'rounded-lg',
                'bg-sky-50',
                'flex',
                'items-center',
                'justify-center',
              )}
            >
              <Bell size={13} className="text-sky-500" />
            </div>
            <span
              className={cn(
                'text-[11px]',
                'font-semibold',
                'text-muted-foreground',
              )}
            >
              {t('Unread Alerts')}
            </span>
          </div>
          <span
            className={cn(
              'text-[11px] font-black px-2 py-0.5 rounded-full',
              unreadCount > 0
                ? 'bg-primary-soft text-primary'
                : 'bg-muted-light text-muted-dark',
            )}
          >
            {formatNumber(unreadCount)}
          </span>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={onMarkAllRead}
            disabled={isPending}
            className={cn(
              'w-full',
              'mt-4',
              'flex',
              'items-center',
              'justify-center',
              'gap-1.5',
              'text-[11px]',
              'font-black',
              'text-primary',
              'hover:underline',
              'cursor-pointer',
              'hover:bg-transparent',
              'h-auto',
              'disabled:opacity-50',
            )}
          >
            <CheckCheck size={13} />
            {t('Mark all read')}
          </Button>
        )}
      </div>
    </div>
  )
}
