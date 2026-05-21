import { Skeleton } from '#/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
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
