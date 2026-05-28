import { createFileRoute } from '@tanstack/react-router'
import { TrustPage } from '#/features/pages'

export const Route = createFileRoute('/trust-safety')({
  component: TrustPage,
})
