import { Skeleton } from '#/components/ui/skeleton'

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16">
      {/* DESKTOP SKELETON */}
      <div className="hidden md:block mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
          {/* Left Column: Images and Tabs (7 cols in ProductDetail) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <Skeleton className="w-20 h-20 rounded-xl" />
                <Skeleton className="w-20 h-20 rounded-xl" />
              </div>
            </div>
            {/* Tabs Skeleton */}
            <div className="h-60 w-full rounded-2xl bg-white border border-border/30 p-6 space-y-4">
              <div className="flex gap-6 pb-2 border-b border-border/30">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          </div>

          {/* Right Column: Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Booking Card Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-border/30 space-y-4">
              <Skeleton className="h-5 w-24 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Calendar Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-border/30 space-y-4">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SKELETON */}
      <div className="block md:hidden bg-background min-h-screen text-foreground pb-10 animate-pulse">
        {/* Full-width Image Gallery Skeleton */}
        <div className="w-full">
          <Skeleton className="w-full h-[300px]" />
        </div>

        {/* Product Details Body Card Skeleton */}
        <div className="px-5 py-6 space-y-6">
          {/* Verified Host Badge */}
          <div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>

          {/* Product Title */}
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-8 w-1/2 rounded-lg -mt-4" />

          {/* Rating, Reviews, Location */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>

          {/* Price & Deposit */}
          <div className="flex items-baseline gap-2 pt-1">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>

          {/* Spec Pills (Horizontal Scroll) */}
          <div className="flex gap-2.5 pb-1">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <hr className="border-border/50" />

          {/* Description Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>

          {/* Lister User Card */}
          <div className="rounded-[20px] border border-border/50 p-4 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
