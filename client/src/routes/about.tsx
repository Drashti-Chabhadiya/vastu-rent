import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '#/features/pages'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})
