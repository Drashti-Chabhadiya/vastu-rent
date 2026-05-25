import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/listings')({
  beforeLoad: () => {
    throw redirect({
      to: '/account/listings',
    })
  },
})
