import { useState } from 'react'
import { useProducts, useCategories } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { Search, SlidersHorizontal, ArrowLeft, LayoutGrid } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { cn } from '#/lib/utils'
import { Slider } from '#/components/ui/slider'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'

import * as Icons from 'lucide-react'

const getIcon = (iconName: string): Icons.LucideIcon => {
  if (!iconName) return Icons.Sparkles

  // Try exact lookup (e.g. "HomeIcon" or "Home")
  if ((Icons as any)[iconName]) {
    return (Icons as any)[iconName]
  }

  // Try stripping "Icon" suffix (e.g. "HomeIcon" -> "Home")
  if (iconName.endsWith('Icon')) {
    const stripped = iconName.slice(0, -4)
    if ((Icons as any)[stripped]) {
      return (Icons as any)[stripped]
    }
  }

  // Try adding "Icon" suffix (e.g. "Home" -> "HomeIcon")
  const withIconSuffix = `${iconName}Icon`
  if ((Icons as any)[withIconSuffix]) {
    return (Icons as any)[withIconSuffix]
  }

  return Icons.Sparkles
}

export function ProductsExplorePage() {
  const { t, formatCurrency } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )

  // Filter States
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(10000)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false)
  const [selectedSort, setSelectedSort] = useState<string>('relevance')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false)

  // Fetch categories & wishlist
  const { data: categories } = useCategories()

  // Fetch active products with price range filters sent to server
  const { data: rawProducts, isLoading } = useProducts({
    search: searchTerm,
    status: 'active',
  })

  // Client-side filtering for rating, verification, category, and price range
  const filteredProducts = rawProducts
    ? rawProducts.filter((product: any) => {
        // 0. Category filter
        if (selectedCategoryId && product.categoryId !== selectedCategoryId)
          return false

        // 1. Price Range filter
        const price = product.price || 0
        if (price < minPrice) return false
        if (maxPrice < 10000 && price > maxPrice) return false

        // 2. Rating filter (e.g. ★ 4.5+)
        if (minRating !== null) {
          const rating = parseFloat(product.rating || '5.0')
          if (rating < minRating) return false
        }

        // 3. Verified only filter (listingType is shop or user's addressType is shop)
        if (verifiedOnly) {
          const isShop =
            product.listingType === 'shop' ||
            product.user?.address?.addressType?.toLowerCase() === 'shop'
          if (!isShop) return false
        }

        return true
      })
    : []

  // Client-side sorting
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (selectedSort === 'price-asc') {
      return a.price - b.price
    }
    if (selectedSort === 'rating') {
      return parseFloat(b.rating || '0') - parseFloat(a.rating || '0')
    }
    return 0 // relevance
  })

  // Dynamic Location description
  const searchLocation = sortedProducts?.[0]?.city || 'Surat'

  return (
    <div className="min-h-full bg-bg-base pt-6 lg:pt-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* DESKTOP HEADER SECTION */}
        <div className="mb-10 hidden lg:block">
          <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
            {t('Explore Marketplace')}
          </h1>
          <p className="text-lg text-muted-foreground/85 max-w-2xl">
            {t(
              'Find everything you need, from high-end cameras to designer outfits, available for rent near you.',
            )}
          </p>
        </div>

        {/* MOBILE TOP BAR (Screen 09 mockup style) */}
        <div className="flex lg:hidden items-center gap-2 mb-4 mt-2">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-muted/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-muted/75 shrink-0 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
            <Input
              placeholder={t('Search for items, brands...')}
              className="pl-10 pr-4 h-9 bg-muted/30 border-border/20 rounded-full text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:ring-brand focus:border-brand shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Drawer
            open={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
          >
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-full border-border/30 bg-card font-bold text-foreground/85 flex items-center gap-1.5 hover:bg-muted-light/20 text-xs shrink-0 cursor-pointer shadow-none"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {t('Filters')}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-6 pb-8 bg-background border-t border-border/20 rounded-t-[28px] focus:outline-none max-w-md mx-auto">
              <DrawerHeader className="px-0 pb-4 text-left flex justify-between items-center">
                <DrawerTitle className="font-display font-semibold text-lg text-foreground">
                  {t('Filters')}
                </DrawerTitle>
                <button
                  onClick={() => {
                    setMinPrice(0)
                    setMaxPrice(10000)
                    setMinRating(null)
                    setVerifiedOnly(false)
                  }}
                  className="text-xs font-bold text-primary hover:underline border-none bg-transparent cursor-pointer"
                >
                  {t('Reset')}
                </button>
              </DrawerHeader>

              <div className="space-y-6 py-2">
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                    {t('PRICE PER DAY')}
                  </div>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[minPrice, maxPrice]}
                    onValueChange={(val) => {
                      setMinPrice(val[0])
                      setMaxPrice(val[1])
                    }}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground mt-2">
                    <span>{formatCurrency(minPrice)}</span>
                    <span>{formatCurrency(maxPrice)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {t('Sort By')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedSort('relevance')}
                      className={cn(
                        'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                        selectedSort === 'relevance'
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                      )}
                    >
                      {t('Relevance')}
                    </button>
                    <button
                      onClick={() => setSelectedSort('price-asc')}
                      className={cn(
                        'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                        selectedSort === 'price-asc'
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                      )}
                    >
                      {t('Price')}
                    </button>
                    <button
                      onClick={() => setSelectedSort('rating')}
                      className={cn(
                        'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                        selectedSort === 'rating'
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                      )}
                    >
                      {t('Rating')}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {t('Rating & Verification')}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setMinRating(minRating === 4.5 ? null : 4.5)
                      }
                      className={cn(
                        'flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs',
                        minRating === 4.5
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                      )}
                    >
                      ★ 4.5+
                    </button>
                    <button
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={cn(
                        'flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs',
                        verifiedOnly
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                      )}
                    >
                      {t('Verified only')}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer mt-6 active:scale-[0.98] transition-all"
                >
                  {t('Show {count} results').replace(
                    '{count}',
                    sortedProducts.length.toString(),
                  )}
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* RESULTS DESCRIPTIONS */}
        <div className="px-1 mb-4 flex justify-between items-center text-xs lg:text-sm text-muted-foreground">
          <span className="font-bold text-muted-foreground">
            {t('{count} results near {location}')
              .replace('{count}', sortedProducts.length.toString())
              .replace('{location}', searchLocation)}
          </span>
        </div>

        {/* CATEGORY TABS (New Visual Style) */}
        <div className="flex gap-4 overflow-x-auto mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 py-3">
          {/* All Items */}
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="flex flex-col items-center gap-2 shrink-0 w-[72px] cursor-pointer group"
          >
            <div
              className={cn(
                'w-[64px] h-[64px] rounded-[24px] flex items-center justify-center transition-all',
                selectedCategoryId === null
                  ? 'bg-foreground shadow-md scale-105'
                  : 'bg-muted-light group-hover:bg-muted',
              )}
            >
              <LayoutGrid
                size={24}
                className={
                  selectedCategoryId === null
                    ? 'text-background'
                    : 'text-muted-foreground'
                }
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-black text-center leading-tight truncate w-full px-1',
                selectedCategoryId === null
                  ? 'text-foreground'
                  : 'text-muted-foreground/80',
              )}
            >
              {t('All items')}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories?.map((cat: any) => {
            const Icon = getIcon(cat.icon)
            const isSelected = cat.id === selectedCategoryId

            return (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategoryId(isSelected ? null : cat.id)
                }
                className="flex flex-col items-center gap-2 shrink-0 w-[72px] cursor-pointer group"
              >
                <div
                  className={cn(
                    'w-[64px] h-[64px] rounded-[24px] flex items-center justify-center transition-all border border-border/10',
                    isSelected
                      ? 'shadow-md scale-105'
                      : 'hover:bg-muted-light/35',
                  )}
                  style={{
                    backgroundColor: isSelected
                      ? cat.color || 'var(--color-primary)'
                      : cat.color
                        ? `color-mix(in srgb, ${cat.color} 12%, var(--color-card))`
                        : 'var(--color-muted-light)',
                    boxShadow: isSelected
                      ? `0 0 0 2px var(--color-background), 0 0 0 4px ${cat.color || 'var(--color-primary)'}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                      : undefined,
                  }}
                >
                  <Icon
                    size={24}
                    style={{
                      color: isSelected
                        ? 'var(--color-background)'
                        : cat.color || 'var(--color-primary)',
                    }}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-black text-center leading-tight truncate w-full px-1',
                    isSelected
                      ? 'text-foreground font-black'
                      : 'text-muted-foreground/80',
                  )}
                >
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* DESKTOP SEARCH BAR */}
        <div className="hidden lg:flex flex-col md:flex-row gap-4 mb-12">
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
            <Sheet
              open={isDesktopFilterOpen}
              onOpenChange={setIsDesktopFilterOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 px-6 rounded-2xl border-border/30 bg-card font-bold text-foreground/80 flex items-center gap-2 hover:bg-muted-light cursor-pointer"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {t('Filters')}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="px-6 py-8 bg-background border-l border-border/20 focus:outline-none w-[400px] sm:max-w-md"
              >
                <SheetHeader className="px-0 pb-4 text-left flex justify-between items-center border-b border-border/10">
                  <SheetTitle className="font-display font-semibold text-lg text-foreground">
                    {t('Filters')}
                  </SheetTitle>
                  <button
                    onClick={() => {
                      setMinPrice(0)
                      setMaxPrice(10000)
                      setMinRating(null)
                      setVerifiedOnly(false)
                    }}
                    className="text-xs font-bold text-primary hover:underline border-none bg-transparent cursor-pointer pr-4"
                  >
                    {t('Reset')}
                  </button>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                      {t('PRICE PER DAY')}
                    </div>
                    <Slider
                      min={0}
                      max={10000}
                      step={100}
                      value={[minPrice, maxPrice]}
                      onValueChange={(val) => {
                        setMinPrice(val[0])
                        setMaxPrice(val[1])
                      }}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground mt-2">
                      <span>{formatCurrency(minPrice)}</span>
                      <span>{formatCurrency(maxPrice)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {t('Sort By')}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedSort('relevance')}
                        className={cn(
                          'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                          selectedSort === 'relevance'
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                        )}
                      >
                        {t('Relevance')}
                      </button>
                      <button
                        onClick={() => setSelectedSort('price-asc')}
                        className={cn(
                          'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                          selectedSort === 'price-asc'
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                        )}
                      >
                        {t('Price')}
                      </button>
                      <button
                        onClick={() => setSelectedSort('rating')}
                        className={cn(
                          'py-2 px-1 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs text-center truncate',
                          selectedSort === 'rating'
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                        )}
                      >
                        {t('Rating')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {t('Rating & Verification')}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setMinRating(minRating === 4.5 ? null : 4.5)
                        }
                        className={cn(
                          'flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs',
                          minRating === 4.5
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                        )}
                      >
                        ★ 4.5+
                      </button>
                      <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={cn(
                          'flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all border border-border/40 cursor-pointer shadow-xs',
                          verifiedOnly
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-card text-muted-foreground hover:bg-muted-light/25',
                        )}
                      >
                        {t('Verified only')}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsDesktopFilterOpen(false)}
                    className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer mt-6 active:scale-[0.98] transition-all"
                  >
                    {t('Show {count} results').replace(
                      '{count}',
                      sortedProducts.length.toString(),
                    )}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* RESULTS CONTAINER */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <>
              {/* MOBILE RESULTS VIEW: 2-COLUMN GRID (Common Mobile Card) */}
              <div className="grid lg:hidden grid-cols-2 gap-3">
                {sortedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="mini"
                  />
                ))}
              </div>

              {/* DESKTOP RESULTS VIEW: VERTICAL GRID CARDS */}
              <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-dark">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('No items found')}
              </h3>
              <p className="text-muted-foreground/85 max-w-md mx-auto">
                {t(
                  "We couldn't find any items matching your search. Try adjusting your keywords or filters.",
                )}
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl font-bold text-primary border-brand hover:bg-primary/5 cursor-pointer"
                onClick={() => {
                  setSearchTerm('')
                  setMinPrice(1000)
                  setMaxPrice(6000)
                  setMinRating(null)
                  setVerifiedOnly(false)
                }}
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
