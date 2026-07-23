import { useState } from 'react'
import { useProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

export function ProductsExplorePage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: products, isLoading } = useProducts({
    search: searchTerm,
    status: 'active',
  })

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
            {t('Explore Marketplace')}
          </h1>
          <p className="text-lg text-muted-foreground/85 max-w-2xl">
            {t('Find everything you need, from high-end cameras to designer outfits, available for rent near you.')}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 w-5 h-5" />
            <Input
              placeholder={t('Search for items, brands, or categories...')}
              className="pl-12 h-14 bg-card border-border/30 rounded-2xl shadow-sm focus:ring-brand focus:border-brand"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-14 px-6 rounded-2xl border-border/30 bg-card font-bold text-foreground/80 flex items-center gap-2 hover:bg-muted-light"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {t('Filters')}
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-lg shadow-brand/20">
              {t('Search')}
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products?.length > 0 ? (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-dark">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('No items found')}
              </h3>
              <p className="text-muted-foreground/85 max-w-md mx-auto">
                {t("We couldn't find any items matching your search. Try adjusting your keywords or filters.")}
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl font-bold text-primary border-brand hover:bg-primary/5"
                onClick={() => setSearchTerm('')}
              >
                {t('Clear Search')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
