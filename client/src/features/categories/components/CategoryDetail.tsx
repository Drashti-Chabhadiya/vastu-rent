import { useParams, Link } from '@tanstack/react-router'
import { useCategories, useProducts } from '#/hook'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { ProductCard } from '#/components/common/ProductCard'
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CategoryDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

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
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <div className="bg-card border-b border-border/30 pb-12 pt-8">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Link
            to={'/categories'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground/85 hover:text-primary transition-colors mb-8"
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
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">
                {category?.name || 'Category Items'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
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
                <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              type="text"
              placeholder={`Search in ${category?.name || 'this category'}...`}
              className="w-full h-14 pl-12 pr-6 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="gap-3 text-foreground/80"
          >
            <SlidersHorizontal size={20} className="text-muted-foreground/70" />
            Filter
          </Button>
        </div>
        {/* Product Grid */}
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[32px] border border-border/30 shadow-sm">
            <div className="w-20 h-20 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-muted-dark" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground/85">
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
