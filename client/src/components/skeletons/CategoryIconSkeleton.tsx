import { Skeleton } from '#/components/ui/skeleton'

export function CategoryIconSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 animate-pulse">
      {/* Category Circle/Badge Skeleton */}
      <Skeleton className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-2xl sm:rounded-3xl" />
      {/* Category Label Skeleton */}
      <Skeleton className="w-16 h-3 rounded" />
    </div>
  )
}
