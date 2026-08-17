import { useTranslation } from '#/context/TranslationContext'
import { ExploreLink } from '#/components/common/ExploreLink'
import { ProductCard } from '#/components/common/ProductCard'
import { useProducts } from '#/hook'

interface SimilarProductsProps {
  categoryId?: string
  currentProductId: string
}

export const SimilarProducts = ({
  categoryId,
  currentProductId,
}: SimilarProductsProps) => {
  const { t } = useTranslation()
  const { data: similarProducts } = useProducts({ categoryId })

  const filteredSimilar =
    similarProducts?.filter((p: any) => p.id !== currentProductId) || []

  if (filteredSimilar.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-border/30">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-foreground">
          {t('Similar Items')}
        </h3>
        <ExploreLink to="/products">{t('View all')}</ExploreLink>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredSimilar.slice(0, 3).map((item: any) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  )
}
