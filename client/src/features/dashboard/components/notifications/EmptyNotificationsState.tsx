import { Bell } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

export const EmptyNotificationsState = () => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-16',
        'gap-3',
      )}
    >
      <div
        className={cn(
          'w-10',
          'h-10',
          'rounded-xl',
          'bg-muted-light',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <Bell size={18} className="text-muted-dark" />
      </div>
      <p
        className={cn(
          'text-[11px]',
          'font-semibold',
          'text-muted-dark',
        )}
      >
        {t('All caught up! No alerts.')}
      </p>
    </div>
  )
}
