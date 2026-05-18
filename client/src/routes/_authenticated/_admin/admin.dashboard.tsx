import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/pages/admin/DashboardPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/dashboard')({
  component: DashboardPage
})
