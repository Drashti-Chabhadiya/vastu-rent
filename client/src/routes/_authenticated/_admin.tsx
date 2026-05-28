import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { normalizeRole } from '#/lib/auth/roles'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context }) => {
    // Read session from parent context
    const session = (context as any).session
    const role = normalizeRole(session?.user?.role)

    if (role !== 'admin') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => <Outlet />,
})
