import { useState } from 'react'
import { useProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'

export function ProductsExplorePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: products, isLoading } = useProducts({ search: searchTerm, status: 'active' })

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Explore Marketplace</h1>
          <p className="text-lg text-gray-500 max-w-2xl">Find everything you need, from high-end cameras to designer outfits, available for rent near you.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search for items, brands, or categories..." 
              className="pl-12 h-14 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-brand focus:border-brand"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-gray-100 bg-white font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-brand/20">
              Search
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
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 max-w-md mx-auto">We couldn't find any items matching your search. Try adjusting your keywords or filters.</p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl font-bold text-primary border-brand hover:bg-primary/5"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
