import { Skeleton } from '#/components/ui/skeleton'

export function PaymentsManagementSkeleton() {
  return (
    <div className="space-y-8 animate-pulse font-sans">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-8 w-60 rounded-lg" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          </div>
        ))}
      </div>

      {/* Withdrawable Balance Banner */}
      <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3.5">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-8 w-60 rounded" />
        </div>
        <Skeleton className="h-14 w-44 rounded-full shrink-0" />
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: History Tables */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 border-b border-border/30 pb-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1 rounded" />
                ))}
              </div>
              {Array.from({ length: 3 }).map((_, r) => (
                <div
                  key={r}
                  className="flex gap-4 py-2 border-b border-border/10"
                >
                  {Array.from({ length: 4 }).map((__, c) => (
                    <Skeleton key={c} className="h-5 flex-1 rounded" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Payout Settlement History */}
        <div className="space-y-8">
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3 w-56 rounded" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-border/30 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
