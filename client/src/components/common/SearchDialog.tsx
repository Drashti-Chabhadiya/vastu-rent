import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useProducts,
  useRecentSearches,
  useSaveRecentSearch,
  useDeleteRecentSearch,
  useClearRecentSearches,
} from '#/hook'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Search, ArrowRight, TrendingUp, Package, X } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Skeleton } from '#/components/ui/skeleton'
import { useTranslation } from '#/context/TranslationContext'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { t, formatDigits } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { data: allProducts, isLoading } = useProducts({
    search: searchQuery || undefined,
  })

  // Dynamic Recent Searches hooks
  const { data: recentSearches = [] } = useRecentSearches({ enabled: open })
  const saveSearchMutation = useSaveRecentSearch()
  const deleteSearchMutation = useDeleteRecentSearch()
  const clearSearchesMutation = useClearRecentSearches()

  const filteredProducts = allProducts?.filter((product: any) => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase()
    return (
      product.title?.toLowerCase().includes(query) ||
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
  })

  const handleSelectProduct = (productId: string) => {
    navigate({ to: '/products/$id', params: { id: productId } })
    onOpenChange(false)
    setSearchQuery('')
  }

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveSearchMutation.mutate(searchQuery.trim())
      navigate({ to: '/products', search: { search: searchQuery } })
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden p-0 border-none bg-card shadow-2xl rounded-[2rem] sm:rounded-[2rem] [&>button]:top-[38px] [&>button]:right-6 [&>button]:opacity-40 [&>button]:hover:opacity-80 [&>button]:transition-all">
        <div className="flex flex-col">
          {/* Search Header */}
          <div className="border-b border-border/30 bg-card pt-7 pb-5 pl-6 pr-14">
            <DialogHeader className="space-y-0">
              <DialogTitle className="sr-only">Search Products</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
              <Input
                autoFocus
                placeholder={t('Search products, categories...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className={cn(
                  'h-11 w-full rounded-full border border-border bg-card pl-11 pr-12 text-sm font-semibold transition-all',
                  'placeholder:text-muted-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus:border-primary outline-none shadow-none',
                )}
              />
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 text-muted-dark hover:bg-muted/50 hover:text-foreground flex items-center justify-center bg-transparent border-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results / Content Area */}
          <div className="max-h-[calc(80vh-140px)] overflow-y-auto custom-scrollbar">
            {!searchQuery.trim() ? (
              <div className="space-y-6 p-6">
                {/* Recent Searches Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-dark">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-dark">
                        {t('Recent Searches')}
                      </span>
                    </div>
                    {recentSearches.length > 0 && (
                      <Button
                        variant="ghost"
                        onClick={() => clearSearchesMutation.mutate()}
                        className="h-auto p-0 text-[10px] font-black text-destructive hover:text-destructive hover:bg-transparent cursor-pointer shadow-none"
                      >
                        {t('Clear All')}
                      </Button>
                    )}
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 bg-primary-soft/40 border border-primary/10 rounded-full pl-3 pr-1 py-1 text-xs font-bold text-foreground/80 hover:border-primary transition-colors"
                        >
                          <span
                            onClick={() => {
                              setSearchQuery(item.query)
                              saveSearchMutation.mutate(item.query)
                              navigate({
                                to: '/products',
                                search: { search: item.query },
                              })
                              onOpenChange(false)
                              setSearchQuery('')
                            }}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            {item.query}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSearchMutation.mutate(item.id)}
                            className="h-5 w-5 rounded-full p-0 text-muted-dark hover:bg-muted hover:text-muted-foreground flex items-center justify-center cursor-pointer shadow-none"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-dark font-bold">
                      {t('Your search history is empty. Try searching for "Furniture" or "Books".')}
                    </p>
                  )}
                </div>

                {/* Quick Access Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-dark">
                    <Package className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-dark">
                      {t('Quick Access')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate({ to: '/products' })
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-border/30 bg-card py-4 px-4 text-xs font-bold text-foreground/80 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary h-auto shadow-none group cursor-pointer"
                    >
                      {t('Browse All Products')}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-dark group-hover:text-primary transition-colors" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate({ to: '/categories' })
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-border/30 bg-card py-4 px-4 text-xs font-bold text-foreground/80 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary h-auto shadow-none group cursor-pointer"
                    >
                      {t('View Categories')}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-dark group-hover:text-primary transition-colors" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-border/30">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full px-6 py-4 flex items-center gap-4 border-b border-border/30 last:border-b-0"
                  >
                    <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-3 w-1/3 rounded" />
                      <Skeleton className="h-2.5 w-2/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="divide-y divide-border/30">
                {filteredProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className={cn(
                      'w-full px-6 py-4 flex items-center gap-4 transition-all hover:bg-primary-soft/50 border-b border-border/30 last:border-b-0 cursor-pointer group text-left',
                      index === 0 && 'border-t border-border/30',
                    )}
                  >
                    {product.images?.[0] ? (
                      <div className="h-11 w-11 rounded-full overflow-hidden bg-muted-light shrink-0 shadow-sm border border-border/30">
                        <img
                          src={product.images[0]}
                          alt={product.title || product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-dark shrink-0 font-bold text-[10px] border border-border">
                        Vastu
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-black text-foreground group-hover:text-primary transition-colors">
                        {product.title || product.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-dark font-bold mt-0.5 max-w-[440px]">
                        {product.description ||
                          'Premium rental product listed in Vastu.'}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-dark group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger text-destructive">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-xs font-black text-foreground">
                  {t('No matching products found')}
                </h3>
                <p className="text-[10px] text-muted-dark font-bold max-w-xs px-4">
                  {t('We couldn\'t find anything matching your search terms. Try searching for general terms like "Furniture" or "Books".')}
                </p>
              </div>
            )}
          </div>

          {/* Search Footer */}
          {searchQuery.trim() &&
            filteredProducts &&
            filteredProducts.length > 0 && (
              <div className="border-t border-border/30 bg-muted-light/50 p-6 rounded-b-[2rem]">
                <Button
                  onClick={() => {
                    saveSearchMutation.mutate(searchQuery.trim())
                    navigate({
                      to: '/products',
                      search: { search: searchQuery },
                    })
                    onOpenChange(false)
                    setSearchQuery('')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-3 font-bold transition-all active:scale-95 h-11 text-xs cursor-pointer shadow-sm"
                >
                  {t('View All Results ({count})', { count: formatDigits(filteredProducts.length) })}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
