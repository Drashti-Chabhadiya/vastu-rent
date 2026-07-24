import { createFileRoute } from '@tanstack/react-router'
import { NotificationsManagement } from '#/features/dashboard'
import { useTranslation } from '#/context/TranslationContext'

export const Route = createFileRoute('/_authenticated/account/notifications')({
  component: () => {
    const { t } = useTranslation()
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page header */}
        <div className="mb-5 px-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
            {t('My Notifications')}
          </h1>
          <p className="text-[13px] text-muted-foreground/85 mt-2 font-medium">
            {t(
              'Stay updated on your booking status, approval updates, and marketplace reviews.',
            )}
          </p>
        </div>

        <NotificationsManagement />
      </div>
    )
  },
})
