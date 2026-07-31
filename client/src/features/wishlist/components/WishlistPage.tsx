import { useWishlist, useWishlistProducts } from '#/hook'
import { ProductCardSkeleton } from '#/components/skeletons'
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'
import { WishlistHeroHeader } from './WishlistHeroHeader'
import { WishlistToolbar } from './WishlistToolbar'
import { WishlistGridItem } from './WishlistGridItem'
import { WishlistListItem } from './WishlistListItem'
import { WishlistEmptySearch } from './WishlistEmptySearch'
import { WishlistEmptyState } from './WishlistEmptyState'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

export function WishlistPage() {
  const { t, formatNumber } = useTranslation()
  const { wishlist, dislike, isLoading: wishlistLoading } = useWishlist()
  const {
    data: products,
    isLoading,
    refetch,
    isFetching,
  } = useWishlistProducts()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<
    'default' | 'price-asc' | 'price-desc' | 'name'
  >('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [clearConfirmId, setClearConfirmId] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    let result = [...products]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q),
      )
    }

    if (sortBy === 'price-asc')
      result.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0))
    else if (sortBy === 'price-desc')
      result.sort((a: any, b: any) => (b.price ?? 0) - (a.price ?? 0))
    else if (sortBy === 'name')
      result.sort((a: any, b: any) => {
        const aName = (a.title ?? a.name ?? '').toLowerCase()
        const bName = (b.title ?? b.name ?? '').toLowerCase()
        return aName.localeCompare(bName)
      })

    return result
  }, [products, searchQuery, sortBy])

  const handleRemove = (productId: string) => {
    dislike(productId)
    setClearConfirmId(null)
  }

  const isPageLoading = isLoading || wishlistLoading

  return (
    <div className="min-h-screen bg-background pt-6 md:pt-24 pb-16 font-sans">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
      >
        <MobileBackHeader title={t('My Wishlist')} />

        <WishlistHeroHeader
          isPageLoading={isPageLoading}
          wishlistLength={wishlist.length}
          productsLength={products?.length ?? 0}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        {!isPageLoading && products && products.length > 0 && (
          <WishlistToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {isPageLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {searchQuery && (
              <p className="text-xs font-bold text-primary/70 mb-4 uppercase tracking-wider">
                {t('{count} result(s) for "{query}"')
                  .replace('{count}', formatNumber(filteredProducts.length))
                  .replace('{query}', searchQuery)}
              </p>
            )}

            {viewMode === 'grid' ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredProducts.map((product: any) => (
                  <WishlistGridItem
                    key={product.id}
                    product={product}
                    clearConfirmId={clearConfirmId}
                    onRemove={handleRemove}
                    onClearConfirm={(id) => setClearConfirmId(id)}
                    onCancelClear={() => setClearConfirmId(null)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {filteredProducts.map((product: any) => (
                  <WishlistListItem
                    key={product.id}
                    product={product}
                    onRemove={handleRemove}
                  />
                ))}
              </motion.div>
            )}
          </>
        ) : searchQuery ? (
          <WishlistEmptySearch
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <WishlistEmptyState />
        )}
      </motion.div>
    </div>
  )
}
