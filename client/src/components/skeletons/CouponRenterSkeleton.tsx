import { Skeleton } from '#/components/ui/skeleton'

export function CouponRenterSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border/30 rounded-[2rem] p-6 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
          <div className="flex justify-between items-center pt-2 border-t border-border/10">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
