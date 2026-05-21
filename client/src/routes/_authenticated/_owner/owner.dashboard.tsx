import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/_owner/owner/dashboard')({
  component: DashboardPage,
})
