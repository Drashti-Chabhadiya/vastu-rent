import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/bookings')({
  beforeLoad: () => {
    throw redirect({
      to: '/account/bookings',
    })
  },
})
