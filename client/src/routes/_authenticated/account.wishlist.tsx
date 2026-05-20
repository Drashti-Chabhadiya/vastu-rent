import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect old /account/wishlist route to the new dedicated /wishlist page
export const Route = createFileRoute('/_authenticated/account/wishlist')({
  beforeLoad: () => {
    throw redirect({ to: '/wishlist', replace: true })
  },
  component: () => null,
})
