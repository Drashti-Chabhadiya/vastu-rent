import { createFileRoute } from '@tanstack/react-router'
import { ProfileListings } from '#/features/profile'

export const Route = createFileRoute('/_authenticated/account/listings')({
  component: ProfileListings,
})
