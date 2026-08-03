import { Skeleton } from '#/components/ui/skeleton'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import { useIsMobile } from '#/hook'

export function CategoryDetailSkeleton() {
  const isMobile = useIsMobile()
  return (
    <div className="min-h-full bg-background">
      {/* Category Header Skeleton */}
      <div className="bg-card border-b border-border/30 pb-12 pt-8 animate-pulse">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Back Button Skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Category Icon Skeleton */}
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shrink-0" />

            {/* Title & Description Skeleton */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-64 rounded-lg" />
              <Skeleton className="h-4 w-full max-w-xl rounded-md" />
              <Skeleton className="h-4 w-3/4 max-w-lg rounded-md" />
            </div>

            {/* Items Count Skeleton */}
            <div className="shrink-0">
              <Skeleton className="h-16 w-20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters and Search Bar Skeleton */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <Skeleton className="h-14 flex-1 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full md:w-32 rounded-2xl shrink-0" />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton
              key={i}
              variant={isMobile ? 'mini' : 'default'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
