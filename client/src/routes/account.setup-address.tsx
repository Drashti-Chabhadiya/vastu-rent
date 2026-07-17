import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { AddressSetupPage } from '#/features/auth/components/address-setup-page'

export const Route = createFileRoute('/account/setup-address')({
  beforeLoad: async () => {
    // Must be logged in to access this page
    const sessionRes = await authClient.getSession()
    const session = sessionRes.data

    if (!session) {
      throw redirect({ to: '/login' })
    }

    // If address already set, skip this page
    const user = session.user as any
    if (user?.city && user?.addressLine1) {
      throw redirect({ to: '/' })
    }

    return { session }
  },
  component: AddressSetupPage,
})
