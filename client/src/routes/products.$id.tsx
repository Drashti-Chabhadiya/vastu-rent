import { createFileRoute, useParams } from '@tanstack/react-router'
import { ProductDetail } from '#/features/products'

export const Route = createFileRoute('/products/$id')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { id } = useParams({ from: '/products/$id' })
  return <ProductDetail id={id} />
}
