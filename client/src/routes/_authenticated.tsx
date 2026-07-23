import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

// Simple local module cache for session to avoid blocking route transitions
// on client-side routing with redundant session network fetches.
let cachedSession: any = null


function AuthenticatedLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (cachedSession) {
      return {
        session: cachedSession,
      }
    }

    const sessionRes = await authClient.getSession()
    const session = sessionRes.data

    if (!session) {
      cachedSession = null
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    cachedSession = session

    return {
      session,
    }
  },
  component: AuthenticatedLayout,
})
