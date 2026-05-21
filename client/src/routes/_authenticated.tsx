import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

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
  component: () => <Outlet />,
})
