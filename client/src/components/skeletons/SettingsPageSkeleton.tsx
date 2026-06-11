import { Skeleton } from '#/components/ui/skeleton'

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse font-sans">
      {/* Page header */}
      <div className="mb-5 px-1 space-y-2">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden min-h-[600px]">
        {/* Left Sub-nav Skeleton */}
        <div className="w-full lg:w-[210px] shrink-0 border-b lg:border-b-0 lg:border-r border-border/30 py-4 flex flex-row lg:flex-col gap-2 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3 w-full">
              <Skeleton className="w-4 h-4 rounded shrink-0" />
              <Skeleton className="h-3 w-24 rounded flex-1" />
            </div>
          ))}
        </div>

        {/* Right Content Skeleton */}
        <div className="flex-1 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/10">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 w-full">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-11 w-32 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  )
}
