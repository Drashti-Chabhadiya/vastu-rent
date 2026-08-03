import { Skeleton } from '#/components/ui/skeleton'

export function ProductCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'mini'
}) {
  if (variant === 'mini') {
    return (
      <div className="bg-card rounded-[20px] p-2.5 shadow-[0_4px_16px_rgb(0,0,0,0.03)] border border-border/20 flex flex-col h-full w-full overflow-hidden">
        {/* Image Area Skeleton */}
        <Skeleton className="w-full h-[120px] rounded-xl mb-3 shrink-0" />

        {/* Title Skeleton */}
        <Skeleton className="h-3 w-3/4 rounded-md mb-2" />

        {/* Price Row Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-3 w-8 rounded-md" />
        </div>

        {/* Location Skeleton */}
        <div className="flex items-center gap-1.5 mt-auto">
          <Skeleton className="h-2 w-3 rounded-md" />
          <Skeleton className="h-2 w-16 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-border/30 flex flex-col h-full w-full">
      {/* Image Area Skeleton */}
      <Skeleton className="w-full h-[220px] rounded-xl mb-4 shrink-0" />

      {/* Title Skeleton */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>

      {/* Price & Rating Row Skeleton */}
      <div className="flex items-center justify-between mb-4 mt-auto">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>

      {/* Location Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-3 w-4 rounded-md" />
        <Skeleton className="h-3 w-28 rounded-md" />
      </div>

      {/* Rent Button Skeleton */}
      <Skeleton className="w-full h-11 rounded-xl shrink-0" />
    </div>
  )
}
