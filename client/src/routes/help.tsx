import { createFileRoute } from '@tanstack/react-router'
import { HelpPage } from '#/features/pages'

export const Route = createFileRoute('/help')({
  component: HelpPage,
})
