import { createFileRoute } from '@tanstack/react-router'
import { NotificationsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/notifications')({
  component: () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        My Notifications
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Stay updated on your booking status, approval updates, and marketplace
        reviews.
      </p>
      <NotificationsManagement />
    </div>
  ),
})
