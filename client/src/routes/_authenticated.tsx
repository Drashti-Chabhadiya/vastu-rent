import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

function AuthenticatedLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const sessionRes = await authClient.getSession()
    const session = sessionRes.data

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    return {
      session,
    }
  },
  component: AuthenticatedLayout,
})
