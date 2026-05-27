import { Skeleton } from '#/components/ui/skeleton'

export function UserProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16">
      <div className="mx-auto max-w-[1200px] px-4 animate-pulse">
        {/* Profile Card Header Skeleton */}
        <div className="bg-card rounded-[40px] p-8 md:p-12 border border-border/30 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0" />
          <div className="flex-1 space-y-4 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Skeleton className="h-10 w-48 mx-auto md:mx-0 rounded-lg" />
              <div className="flex gap-2 justify-center md:justify-start">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>
            <div className="flex justify-center md:justify-start gap-4 pt-2">
              <Skeleton className="h-12 w-36 rounded-2xl" />
              <Skeleton className="h-12 w-36 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Listings Section Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-4 border border-border/30 flex flex-col h-full space-y-4"
              >
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-11 w-full rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
