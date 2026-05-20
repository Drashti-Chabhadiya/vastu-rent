import { createFileRoute } from '@tanstack/react-router'
import { ProductsExplorePage } from '#/features/products'

export const Route = createFileRoute('/products/')({
  component: ProductsExplorePage
})
