import { Link } from '@tanstack/react-router'
import { useWishlist, useWishlistProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Grid3X3,
  List,
  RefreshCw,
  Bookmark,
  X,
  ChevronDown,
  Check,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export function WishlistPage() {
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
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    <div className="min-h-screen bg-background pt-24 pb-16 font-sans">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
      >
        {/* Back navigation */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground/85 hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-danger flex items-center justify-center shadow-sm">
                  <Heart
                    size={20}
                    className="text-danger-foreground fill-rose-500"
                  />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-danger-foreground bg-danger px-3 py-1 rounded-full">
                  My Wishlist
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
                Saved Items
              </h1>
              <p className="text-sm text-muted-foreground/85 font-medium mt-1">
                {isPageLoading
                  ? 'Loading your saved items…'
                  : `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved for later`}
              </p>
            </div>

            {/* Stats pill */}
            {!isPageLoading && products && products.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-card border border-border/30 shadow-sm px-4 py-2.5 rounded-2xl">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-xs font-black text-foreground/80">
                    {products.length} saved
                  </span>
                </div>
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl text-xs text-muted-foreground/85 hover:text-foreground border-border/30 hover:border-border"
                >
                  <RefreshCw
                    size={13}
                    className={isFetching ? 'animate-spin' : ''}
                  />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Toolbar — shown whenever products have loaded, regardless of filter results */}
        {!isPageLoading && products && products.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none"
              />
              <Input
                type="text"
                placeholder="Search saved items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 rounded-2xl bg-card border border-border/30 shadow-sm text-sm font-medium text-foreground/90 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 p-0 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground/70 transition-colors active:scale-95"
                >
                  <X size={11} />
                </Button>
              )}
            </div>

            {/* Sort — custom themed dropdown */}
            <div ref={sortRef} className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsSortOpen((v) => !v)}
                className={`h-11 pl-3.5 pr-3.5 rounded-2xl bg-card border shadow-sm text-sm font-bold flex items-center gap-2.5 min-w-[180px] justify-between transition-all hover:bg-transparent ${
                  isSortOpen
                    ? 'border-primary/40 ring-2 ring-primary/20 text-primary'
                    : 'border-border/30 text-foreground/80 hover:border-primary/30 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={14}
                    className="text-primary/60 shrink-0"
                  />
                  <span>
                    {sortBy === 'default'
                      ? 'Default Order'
                      : sortBy === 'name'
                        ? 'Name A–Z'
                        : sortBy === 'price-asc'
                          ? 'Price: Low → High'
                          : 'Price: High → Low'}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground/70 transition-transform duration-200 shrink-0 ${
                    isSortOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </Button>

              {isSortOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/30 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {(
                    [
                      { value: 'default', label: 'Default Order' },
                      { value: 'name', label: 'Name A–Z' },
                      { value: 'price-asc', label: 'Price: Low → High' },
                      { value: 'price-desc', label: 'Price: High → Low' },
                    ] as const
                  ).map((opt) => (
                    <Button
                      variant="ghost"
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value)
                        setIsSortOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors rounded-none justify-start ${
                        sortBy === opt.value
                          ? 'text-primary bg-primary/5 hover:bg-primary/5 hover:text-primary'
                          : 'text-foreground/80 hover:bg-muted-light hover:text-foreground'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && (
                        <Check
                          size={13}
                          className="text-primary shrink-0 ml-auto"
                        />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-card border border-border/30 shadow-sm p-1 rounded-2xl">
              <Button
                variant="ghost"
                onClick={() => setViewMode('grid')}
                className={`p-2 h-auto rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
                }`}
                title="Grid view"
              >
                <Grid3X3 size={15} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className={`p-2 h-auto rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
                }`}
                title="List view"
              >
                <List size={15} />
              </Button>
            </div>
          </div>
        )}

        {isPageLoading ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Result count when searching */}
            {searchQuery && (
              <p className="text-xs font-bold text-primary/70 mb-4 uppercase tracking-wider">
                {filteredProducts.length} result
                {filteredProducts.length !== 1 ? 's' : ''} for &ldquo;
                {searchQuery}&rdquo;
              </p>
            )}

            {viewMode === 'grid' ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product: any) => (
                  <motion.div key={product.id} variants={fadeUp} className="relative group">
                    <ProductCard product={product} />
                    {clearConfirmId === product.id ? (
                      <div className="absolute inset-0 bg-card/95 rounded-3xl flex flex-col items-center justify-center gap-3 z-10 animate-in fade-in duration-150">
                        <p className="text-xs font-bold text-foreground/80 text-center px-4">
                          Remove from wishlist?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRemove(product.id)}
                            variant="destructive"
                            size="sm"
                            className="h-8 px-4 text-xs"
                          >
                            Remove
                          </Button>
                          <Button
                            onClick={() => setClearConfirmId(null)}
                            variant="secondary"
                            size="sm"
                            className="h-8 px-4 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setClearConfirmId(product.id)}
                        variant="outline"
                        size="icon"
                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-card/90 backdrop-blur-sm border border-border/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-danger hover:border-danger/30 shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2
                          size={13}
                          className="text-muted-foreground/70 hover:text-destructive transition-colors"
                        />
                      </Button>
                    )}
                  </motion.div>
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
                  <motion.div
                    key={product.id}
                    variants={fadeUp}
                    className="bg-card border border-border/30 rounded-2xl shadow-sm flex items-center gap-4 p-4 hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="shrink-0"
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          `https://placehold.co/80x80/f8f8f8/ccc?text=Item`
                        }
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-muted-light"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to="/products/$id" params={{ id: product.id }}>
                        <h3 className="font-black text-foreground text-sm truncate hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.category?.name && (
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md mt-1">
                          {product.category.name}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground/85 mt-1.5 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-sm font-black text-foreground">
                        ₹{(product.price ?? 0).toLocaleString('en-IN')}
                        <span className="text-[10px] font-bold text-muted-foreground/70">
                          /day
                        </span>
                      </p>
                      <div className="flex gap-2">
                        <Link to="/products/$id" params={{ id: product.id }}>
                          <Button
                            size="sm"
                            className="h-7 px-3 text-[11px] rounded-lg"
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleRemove(product.id)}
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[11px] rounded-lg bg-danger hover:bg-danger text-destructive hover:text-destructive border-none shadow-none active:scale-[0.98] transition-all"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        ) : searchQuery ? (
          // No search results (search returned 0 items from an otherwise non-empty wishlist)
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-primary/30" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              No results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="text-sm text-muted-foreground/85 mb-4">
              Try adjusting your search terms.
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-colors p-0 h-auto"
            >
              Clear search
            </Button>
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Animated illustration */}
            <div className="relative mb-8">
              <div className="w-28 h-28 bg-danger rounded-full flex items-center justify-center shadow-inner">
                <Heart size={48} className="text-danger-foreground/45" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-warning rounded-full flex items-center justify-center animate-bounce shadow-sm">
                <Bookmark size={14} className="text-warning-foreground" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-muted-foreground/85 font-medium mb-8 max-w-xs leading-relaxed">
              Browse our catalogue and tap the heart icon on any item to save it
              here for later.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <ShoppingBag size={16} />
                  Browse Catalogue
                </Button>
              </Link>
              <Link to="/" hash="categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Grid3X3 size={16} />
                  Explore Categories
                </Button>
              </Link>
            </div>

            {/* Category suggestions */}
            <div className="mt-12 text-left w-full max-w-xl">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 mb-4 text-center">
                Popular right now
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Electronics',
                  'Furniture',
                  'Vehicles',
                  'Cameras',
                  'Appliances',
                  'Tools',
                ].map((cat) => (
                  <Link
                    key={cat}
                    to="/products"
                    className="px-4 py-2 bg-card border border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
