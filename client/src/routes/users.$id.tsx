import { createFileRoute } from '@tanstack/react-router'
import { UserProfilePage } from '#/features/users'

export const Route = createFileRoute('/users/$id')({
  component: UserProfilePage
})
