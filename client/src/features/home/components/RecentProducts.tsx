import { Sparkles } from 'lucide-react'
import { useProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { ExploreLink } from '#/components/common/ExploreLink'
import { useTranslation } from '#/context/TranslationContext'

export function RecentProducts() {
  const { t } = useTranslation()
  const { data: products, isLoading } = useProducts({ status: 'active' })

  // Sort by date/id descending to get the latest 4 added items
  const recentProducts = products
    ? [...products]
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4)
    : []

  return (
    <section className="relative py-6 md:py-20 overflow-hidden bg-background">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,41,27,0.02),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,41,27,0.01),transparent_50%)] pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-8 relative z-10 border-b border-border/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />{' '}
              {t('Fresh Inventory')}
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-brand-ink tracking-tight leading-none">
              {t('Recent Additions')}
            </h2>
          </div>
          <ExploreLink to="/products">{t('Explore')}</ExploreLink>
        </div>

        <div className="relative z-10">
          {/* MOBILE CARDS VERTICAL GRID (Common Mobile Card) */}
          <div className="grid md:hidden grid-cols-2 gap-3 pb-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-[180px] bg-muted animate-pulse rounded-[20px]"
                />
              ))
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="mini"
                />
              ))
            ) : (
              <div className="col-span-2 py-10 text-center font-bold text-sm text-muted-foreground bg-muted-light rounded-[20px]">
                {t('No new arrivals.')}
              </div>
            )}
          </div>

          {/* DESKTOP CARDS GRID */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 bg-muted-light rounded-3xl text-center border border-dashed border-border">
                <p className="text-muted-foreground/85 font-bold">
                  {t('No newly added items found.')}
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Check back later for fresh listings!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
