import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

// Simple local module cache for session to avoid blocking route transitions
// on client-side routing with redundant session network fetches.
let cachedSession: any = null

// Routes where we should NOT redirect even if address is missing
const ADDRESS_EXEMPT_PATHS = [
  '/account/setup-address',
  '/login',
  '/signup',
  '/verify-email',
  '/reset-password',
]

function AuthenticatedLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (cachedSession) {
      // Check address guard even for cached sessions
      const user = cachedSession.user
      const isExempt = ADDRESS_EXEMPT_PATHS.some((p) =>
        location.pathname.startsWith(p),
      )
      if (!isExempt && (!user?.city || !user?.addressLine1)) {
        // Bust cache so next load gets fresh session
        cachedSession = null
        throw redirect({ to: '/account/setup-address' })
      }
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

    // Address guard: if address is not set, redirect to setup page
    const user = session.user as any
    const isExempt = ADDRESS_EXEMPT_PATHS.some((p) =>
      location.pathname.startsWith(p),
    )
    if (!isExempt && (!user?.city || !user?.addressLine1)) {
      throw redirect({ to: '/account/setup-address' })
    }

    return {
      session,
    }
  },
  component: AuthenticatedLayout,
})
