import { cn } from '#/lib/utils'
import { formatNumericDate } from '#/lib/date-utils'
import {
  getNotificationIcon,
  getNotificationColorClasses,
} from '#/lib/notification-utils'

interface NotificationItemProps {
  notification: any
  onClick: (notif: any) => void
}

export const NotificationItem = ({
  notification,
  onClick,
}: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type)
  const colorCls = getNotificationColorClasses(notification.type)

  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        'flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-muted-light/60 group',
        !notification.isRead && 'bg-primary-soft/40',
      )}
    >
      <div className={cn('flex', 'items-center', 'gap-3', 'min-w-0')}>
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            !notification.isRead ? 'bg-primary' : 'bg-transparent',
          )}
        />

        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            colorCls,
          )}
        >
          <Icon size={16} strokeWidth={2.5} />
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              'text-[12px] truncate',
              !notification.isRead
                ? 'font-black text-foreground'
                : 'font-semibold text-foreground/80',
            )}
          >
            {notification.title}
          </p>
          <p
            className={cn(
              'text-[10px]',
              'font-medium',
              'text-muted-dark',
              'mt-0.5',
              'truncate',
            )}
          >
            {notification.message}
          </p>
        </div>
      </div>

      <span
        className={cn(
          'text-[10px]',
          'font-semibold',
          'text-muted-dark',
          'shrink-0',
          'ml-4',
        )}
      >
        {formatNumericDate(notification.createdAt)}
      </span>
    </div>
  )
}
