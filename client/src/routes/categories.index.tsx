import { createFileRoute } from '@tanstack/react-router'
import { CategoryList } from '#/features/categories'

export const Route = createFileRoute('/categories/')({
  component: CategoryList,
})
