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
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden p-0 border-none bg-white shadow-2xl rounded-[2rem] sm:rounded-[2rem] [&>button]:top-[38px] [&>button]:right-6 [&>button]:opacity-40 [&>button]:hover:opacity-80 [&>button]:transition-all">
        <div className="flex flex-col">
          {/* Search Header */}
          <div className="border-b border-slate-50 bg-white pt-7 pb-5 pl-6 pr-14">
            <DialogHeader className="space-y-0">
              <DialogTitle className="sr-only">Search Products</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className={cn(
                  'h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-12 text-sm font-semibold transition-all',
                  'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5222]/20 focus-visible:border-[#2d5222] focus:border-[#2d5222] outline-none shadow-none',
                )}
              />
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-650 flex items-center justify-center bg-transparent border-none cursor-pointer"
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
                    <div className="flex items-center gap-2 text-slate-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Recent Searches
                      </span>
                    </div>
                    {recentSearches.length > 0 && (
                      <Button
                        variant="ghost"
                        onClick={() => clearSearchesMutation.mutate()}
                        className="h-auto p-0 text-[10px] font-black text-red-500 hover:text-red-650 hover:bg-transparent cursor-pointer shadow-none"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 bg-[#F4F8F1]/40 border border-[#2d5222]/10 rounded-full pl-3 pr-1 py-1 text-xs font-bold text-slate-700 hover:border-[#2d5222] transition-colors"
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
                            className="cursor-pointer hover:text-[#2d5222] transition-colors"
                          >
                            {item.query}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSearchMutation.mutate(item.id)}
                            className="h-5 w-5 rounded-full p-0 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center cursor-pointer shadow-none"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-bold">
                      Your search history is empty. Try searching for
                      "Furniture" or "Books".
                    </p>
                  )}
                </div>

                {/* Quick Access Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Quick Access
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate({ to: '/products' })
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white py-4 px-4 text-xs font-bold text-slate-700 transition-all hover:border-[#2d5222] hover:bg-[#2d5222]/5 hover:text-[#2d5222] h-auto shadow-none group cursor-pointer"
                    >
                      Browse All Products
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2d5222] transition-colors" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate({ to: '/categories' })
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white py-4 px-4 text-xs font-bold text-slate-700 transition-all hover:border-[#2d5222] hover:bg-[#2d5222]/5 hover:text-[#2d5222] h-auto shadow-none group cursor-pointer"
                    >
                      View Categories
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2d5222] transition-colors" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[#2d5222]" />
                <span className="text-xs text-slate-400 font-bold">
                  Searching catalogue...
                </span>
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className={cn(
                      'w-full px-6 py-4 flex items-center gap-4 transition-all hover:bg-[#F4F8F1]/50 border-b border-slate-50 last:border-b-0 cursor-pointer group text-left',
                      index === 0 && 'border-t border-slate-50',
                    )}
                  >
                    {product.images?.[0] ? (
                      <div className="h-11 w-11 rounded-full overflow-hidden bg-slate-50 shrink-0 shadow-sm border border-slate-100">
                        <img
                          src={product.images[0]}
                          alt={product.title || product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-[10px] border border-slate-200">
                        Vastu
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-black text-slate-900 group-hover:text-[#2d5222] transition-colors">
                        {product.title || product.name}
                      </p>
                      <p className="truncate text-[10px] text-slate-400 font-bold mt-0.5 max-w-[440px]">
                        {product.description ||
                          'Premium rental product listed in Vastu.'}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-[#2d5222] transition-all group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-xs font-black text-slate-900">
                  No matching products found
                </h3>
                <p className="text-[10px] text-slate-400 font-bold max-w-xs px-4">
                  We couldn't find anything matching your search terms. Try
                  searching for general terms like "Furniture" or "Books".
                </p>
              </div>
            )}
          </div>

          {/* Search Footer */}
          {searchQuery.trim() &&
            filteredProducts &&
            filteredProducts.length > 0 && (
              <div className="border-t border-slate-50 bg-slate-50/50 p-6 rounded-b-[2rem]">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d5222] hover:bg-[#1e3a17] text-white px-4 py-3 font-bold transition-all active:scale-95 h-11 text-xs cursor-pointer shadow-sm"
                >
                  View All Results ({filteredProducts.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
