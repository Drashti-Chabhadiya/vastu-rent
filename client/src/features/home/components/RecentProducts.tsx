import { ArrowUpRight, Sparkles } from 'lucide-react'
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
    <section className="bg-background py-20 overflow-hidden border-t border-border/30/50">
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
            <h2 className="text-3xl font-black text-foreground leading-tight">
              Recent Additions
            </h2>
            <p className="text-muted-foreground/85 font-medium mt-1">
              Be the first to rent these brand new listings.
            </p>
          </div>
          <Link
            to="/products"
            className="group inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary underline decoration-primary/20 decoration-2 underline-offset-[6px] transition-all hover:decoration-primary"
          >
            Explore all new arrivals
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
              <div className="col-span-full py-16 bg-muted-light rounded-3xl text-center border border-dashed border-border">
                <p className="text-muted-foreground/85 font-bold">
                  No newly added items found.
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
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
