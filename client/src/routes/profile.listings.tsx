import { createFileRoute } from '@tanstack/react-router'
import { ProfileListings } from '#/features/profile'

export const Route = createFileRoute('/profile/listings')({
  component: ProfileListings
})
