import { Skeleton } from "#/components/ui/skeleton"

export function CategoryCardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Category Image Area Skeleton */}
      <Skeleton className="aspect-[4/5] w-full rounded-[1.75rem]" />
      
      {/* Category Details Row Skeleton */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}
