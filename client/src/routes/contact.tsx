import { createFileRoute } from '@tanstack/react-router'
import { ContactPage } from '#/features/pages'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})
