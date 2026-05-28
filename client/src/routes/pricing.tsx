import { createFileRoute } from '@tanstack/react-router'
import { PricingPage } from '#/features/pages'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})
