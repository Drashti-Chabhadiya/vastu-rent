import { createFileRoute } from '@tanstack/react-router'
import { LoginFormPage } from '#/features/auth'

export const Route = createFileRoute('/login')({
  component: LoginFormPage,
})
