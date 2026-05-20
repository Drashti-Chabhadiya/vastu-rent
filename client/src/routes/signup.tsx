import { createFileRoute } from '@tanstack/react-router'
import { SignUpFormPage } from '#/features/auth'

export const Route = createFileRoute('/signup')({
  component: SignUpFormPage,
})
