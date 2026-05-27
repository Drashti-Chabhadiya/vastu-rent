import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useProducts } from '#/hook'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Search,
  Loader2,
  ArrowRight,
  TrendingUp,
  Package,
  X,
} from 'lucide-react'
import { cn } from '#/lib/utils'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { data: allProducts, isLoading } = useProducts({
    search: searchQuery || undefined,
  })

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
      navigate({ to: '/products', search: { search: searchQuery } })
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  const recentSearches = ['Furniture', 'Electronics', 'Tools', 'Books']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] max-w-2xl overflow-hidden p-0 border-0 bg-white shadow-2xl">
        <div className="flex flex-col">
          {/* Search Header */}
          <div className="border-b border-slate-100 bg-white p-4 sm:p-6">
            <DialogHeader className="space-y-0">
              <DialogTitle className="sr-only">Search Products</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="border-0 bg-slate-50 pl-12 pr-12 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[calc(70vh-120px)] overflow-y-auto">
            {!searchQuery.trim() ? (
              <div className="space-y-6 p-4 sm:p-6">
                {/* Trending Section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Trending Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => setSearchQuery(search)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Quick Access
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate({ to: '/products' })}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      Browse All Products
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate({ to: '/categories' })}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      View Categories
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-slate-500">Searching...</span>
                </div>
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product: any, index: number) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 sm:px-6 sm:py-4',
                      index === 0 && 'border-t border-slate-100',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title || product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {product.title || product.name}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {product.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mb-1 font-medium text-slate-900">
                  No products found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>

          {/* Search Footer */}
          {searchQuery.trim() &&
            filteredProducts &&
            filteredProducts.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6">
                <button
                  onClick={() => {
                    navigate({
                      to: '/products',
                      search: { search: searchQuery },
                    })
                    onOpenChange(false)
                    setSearchQuery('')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                >
                  View All Results ({filteredProducts.length})
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
