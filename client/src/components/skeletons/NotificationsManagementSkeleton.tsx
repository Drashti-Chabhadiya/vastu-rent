import { Skeleton } from '#/components/ui/skeleton'

export const NotificationsManagementSkeleton = () => {
  return (
    <div className="divide-y divide-border/30 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="min-w-0 space-y-2 flex-1">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-16 rounded ml-4 shrink-0" />
        </div>
      ))}
    </div>
  )
}
