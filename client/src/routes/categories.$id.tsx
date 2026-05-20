import { createFileRoute } from '@tanstack/react-router'
import { CategoryDetail } from '#/features/categories'

export const Route = createFileRoute('/categories/$id')({
  component: CategoryDetail,
})
