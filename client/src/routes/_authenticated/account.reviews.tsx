import { createFileRoute } from '@tanstack/react-router'
import { ReviewsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/reviews')({
  component: ReviewsManagement,
})
