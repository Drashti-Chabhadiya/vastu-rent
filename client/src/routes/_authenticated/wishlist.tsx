import { createFileRoute } from '@tanstack/react-router'
import { WishlistPage } from '#/features/wishlist'

export const Route = createFileRoute('/_authenticated/wishlist')({
  component: WishlistPage,
})
