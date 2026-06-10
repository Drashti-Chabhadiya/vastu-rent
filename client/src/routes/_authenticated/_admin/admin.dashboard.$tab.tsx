import { createFileRoute } from '@tanstack/react-router'
import { DashboardTabContent } from '#/features/dashboard'

export const Route = createFileRoute(
  '/_authenticated/_admin/admin/dashboard/$tab',
)({
  component: DashboardTabContent,
})
