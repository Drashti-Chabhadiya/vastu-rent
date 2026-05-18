import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/pages/admin/DashboardPage'

export const Route = createFileRoute('/_authenticated/_admin/superadmin/dashboard')({
  component: DashboardPage
})
