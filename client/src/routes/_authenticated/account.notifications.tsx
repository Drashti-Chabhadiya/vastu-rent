import { createFileRoute } from '@tanstack/react-router'
import { NotificationsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/notifications')({
  component: () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header */}
      <div className="mb-5 px-1">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
          My Notifications
        </h1>
        <p className="text-[13px] text-muted-foreground/85 mt-2 font-medium">
          Stay updated on your booking status, approval updates, and marketplace
          reviews.
        </p>
      </div>

      <NotificationsManagement />
    </div>
  ),
})
