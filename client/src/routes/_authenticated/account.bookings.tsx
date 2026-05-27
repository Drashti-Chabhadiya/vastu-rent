import { createFileRoute } from '@tanstack/react-router'
import { MyBookings } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/bookings')({
  component: () => <MyBookings />,
})
