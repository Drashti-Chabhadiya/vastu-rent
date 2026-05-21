import { createFileRoute } from '@tanstack/react-router'
import { ReviewsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/reviews')({
  component: () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        My Reviews & Feedback
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        View feedback and ratings submitted by renters on your listings or
        reviews you've written.
      </p>
      <ReviewsManagement />
    </div>
  ),
})
