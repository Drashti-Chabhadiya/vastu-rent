import { createFileRoute } from '@tanstack/react-router'
import { SignUpFormPage } from '#/features/auth'

type SignupSearch = {
  email?: string
  name?: string
}

export const Route = createFileRoute('/signup')({
  validateSearch: (search: Record<string, unknown>): SignupSearch => {
    return {
      email: search.email as string | undefined,
      name: search.name as string | undefined,
    }
  },
  component: SignUpFormPage,
})
