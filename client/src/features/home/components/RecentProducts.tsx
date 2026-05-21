import { ChevronRight, Sparkles } from 'lucide-react'
import { useProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { Link } from '@tanstack/react-router'

export function RecentProducts() {
  const { data: products, isLoading } = useProducts({ status: 'active' })

  // Sort by date/id descending to get the latest 4 added items
  const recentProducts = products
    ? [...products]
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4)
    : []

  return (
    <section className="bg-white py-20 overflow-hidden border-t border-gray-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" />
                Just Added
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Recent Additions
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Be the first to rent these brand new listings.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-black text-primary hover:text-primary-hover flex items-center gap-1.5 group transition-all shrink-0 self-start sm:self-center"
          >
            Explore all new arrivals
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 bg-gray-50 rounded-3xl text-center border border-dashed border-gray-200">
                <p className="text-gray-500 font-bold">
                  No newly added items found.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Check back later for fresh listings!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
