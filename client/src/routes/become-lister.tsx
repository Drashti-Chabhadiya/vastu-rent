import { createFileRoute } from '@tanstack/react-router'
import { BecomeListerPage } from '#/features/pages'

export const Route = createFileRoute('/become-lister')({
  component: BecomeListerPage,
})
