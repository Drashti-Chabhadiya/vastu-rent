import { useParams, Link } from '@tanstack/react-router'
import { useCategories, useProducts } from '#/hook'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { ProductCard } from '#/components/common/ProductCard'
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CategoryDetailSkeleton } from '#/components/skeletons'

export function CategoryDetail() {
  const { id } = useParams({ from: '/categories/$id' })
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: id,
  })

  const [searchTerm, setSearchTerm] = useState('')

  const category = categories?.find((c: any) => c.id === id)

  const filteredProducts = products?.filter((p: any) =>
    (p.title || p.name)?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (productsLoading || categoriesLoading || !category) {
    return <CategoryDetailSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Link
            to={'/categories'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to All Categories
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {category && (
              <CategoryIcon
                category={category}
                size="xl"
                className="shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                {category?.name || 'Category Items'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Explore our curated collection of{' '}
                {category?.name?.toLowerCase() || 'items'} available for rent.
                High quality, affordable, and ready for you.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-6 py-3 bg-primary/5 rounded-2xl border border-brand/10">
                <p className="text-2xl font-bold text-primary">
                  {products?.length || 0}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <div className="relative flex-1 group w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder={`Search in ${category?.name || 'this category'}...`}
              className="w-full h-14 pl-12 pr-6 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-14 px-8 bg-white border border-gray-200 rounded-2xl flex items-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
            <SlidersHorizontal size={20} className="text-gray-400" />
            Filter
          </button>
        </div>
        {/* Product Grid */}
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              We couldn't find any items matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
