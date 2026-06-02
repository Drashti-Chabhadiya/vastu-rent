// Reusable Stat Card Skeleton
const StatCardSkeleton = () => (
  <div className="bg-card rounded-[2rem] p-6 border border-border/30 shadow-sm flex items-center justify-between animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-3.5 bg-muted rounded-md w-28" />
      <div className="h-7 bg-muted rounded-lg w-20" />
      <div className="h-3 bg-muted/50 rounded-md w-32" />
    </div>
    <div className="w-12 h-12 bg-muted/50 rounded-xl shrink-0" />
  </div>
)

// Reusable Table Skeleton
const TableSkeleton = ({
  rows = 4,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) => (
  <div className="space-y-4 w-full animate-pulse">
    {/* Header */}
    <div className="flex gap-4 border-b border-border/30 pb-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3.5 bg-muted rounded-md flex-1" />
      ))}
    </div>
    {/* Body Rows */}
    {Array.from({ length: rows }).map((__, r) => (
      <div
        key={r}
        className="flex gap-4 py-3 border-b border-border/30/50 items-center"
      >
        {Array.from({ length: cols }).map((___, c) => (
          <div key={c} className="h-5 bg-muted/50 rounded-lg flex-1" />
        ))}
      </div>
    ))}
  </div>
)


// Unified Dashboard Full Page Loader (prevents layout shifting)
export const DashboardOverviewSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-300">
    {/* Page Title Header */}
    <div className="space-y-2.5">
      <div className="h-8 bg-muted rounded-lg w-48" />
      <div className="h-4 bg-muted/50 rounded-md w-96" />
    </div>

    {/* Stat cards grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Chart & lists row */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-card rounded-[2rem] border border-border/30 shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded-md w-36" />
          <div className="h-3 bg-muted/50 rounded-md w-64" />
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
      <div className="bg-card rounded-[2rem] border border-border/30 shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded-md w-28" />
          <div className="h-3 bg-muted/50 rounded-md w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-11 h-11 bg-muted/50 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-muted/50 rounded w-2/3" />
                <div className="h-3 bg-muted/50 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
