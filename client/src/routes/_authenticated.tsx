import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { getCachedSession, setCachedSession } from '#/context/SessionContext'

function AuthenticatedLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const cached = getCachedSession()
    if (cached) {
      return {
        session: cached,
      }
    }

    const sessionRes = await authClient.getSession()
    const session = sessionRes.data

    if (!session) {
      setCachedSession(null)
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    setCachedSession(session)

    return {
      session,
    }
  },
  component: AuthenticatedLayout,
})
