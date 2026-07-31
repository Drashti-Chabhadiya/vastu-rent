import { useParams, Link } from '@tanstack/react-router'
import { useCategories, useIsMobile, useProducts } from '#/hook'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { ProductCard } from '#/components/common/ProductCard'
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CategoryDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { motion } from 'motion/react'
import { EASE, fadeUp, stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

export function CategoryDetail() {
  const { t, formatDigits } = useTranslation()
  const { id } = useParams({ from: '/categories/$id' })
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: id,
  })
  const isMobile = useIsMobile()

  const [searchTerm, setSearchTerm] = useState('')

  const category = categories?.find((c: any) => c.id === id)

  const filteredProducts = products?.filter((p: any) =>
    (p.title || p.name)?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (productsLoading || categoriesLoading || !category) {
    return <CategoryDetailSkeleton />
  }

  return (
    <div className="min-h-full bg-background">
      {/* Category Header */}
      <div className="bg-card border-b border-border/30 pb-6 md:pb-12 pt-4 md:pt-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <MobileBackHeader title={t(category?.name || 'Category Items')} />
          <motion.div variants={fadeUp}>
            <Link
              to={'/categories'}
              className="hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground/85 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              {t('Back to All Categories')}
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-4 md:mt-0">
            {category && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex justify-center md:block"
              >
                <CategoryIcon
                  category={category}
                  size="xl"
                  className="shadow-lg scale-75 md:scale-100"
                />
              </motion.div>
            )}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                variants={fadeUp}
                className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2 md:mb-3"
              >
                {t(category?.name || 'Category Items')}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0"
              >
                {t(
                  'Explore our curated collection of items available for rent. High quality, affordable, and ready for you.',
                )}
              </motion.p>
            </div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center md:justify-start gap-4"
            >
              <div className="text-center px-4 md:px-6 py-2 md:py-3 bg-primary/5 rounded-2xl border border-brand/10">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {formatDigits(products?.length || 0)}
                </p>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">
                  {t('ITEMS')}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Filters and Search Bar */}
        <div className="flex flex-row items-center gap-2 md:gap-4 mb-6 md:mb-10">
          <div className="relative flex-1 group w-full">
            <Search
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors scale-75 md:scale-100"
              size={20}
            />
            <Input
              type="text"
              placeholder={`${t('Search')}...`}
              className="w-full h-11 md:h-14 pl-10 md:pl-12 pr-4 md:pr-6 bg-card border border-border rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2 text-foreground/80 h-11 md:h-14 px-3 md:px-6 rounded-xl md:rounded-2xl"
          >
            <SlidersHorizontal size={16} className="text-muted-foreground/70" />
            <span className="hidden sm:inline">{t('Filter')}</span>
          </Button>
        </div>
        {/* Product Grid */}
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[32px] border border-border/30 shadow-sm">
            <div className="w-20 h-20 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-muted-dark" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t('No items found')}
            </h3>
            <p className="text-muted-foreground/85">
              {t("We couldn't find any items matching your search criteria.")}
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
          >
            {filteredProducts?.map((product: any) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                className="flex h-full"
              >
                <ProductCard
                  product={product}
                  variant={isMobile ? 'mini' : 'default'}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
