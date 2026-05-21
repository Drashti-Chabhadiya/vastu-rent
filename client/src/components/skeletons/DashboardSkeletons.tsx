// Reusable Stat Card Skeleton
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-3.5 bg-gray-200 rounded-md w-28" />
      <div className="h-7 bg-gray-200 rounded-lg w-20" />
      <div className="h-3 bg-gray-100 rounded-md w-32" />
    </div>
    <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
  </div>
)

// Reusable Table Skeleton
export const TableSkeleton = ({
  rows = 4,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) => (
  <div className="space-y-4 w-full animate-pulse">
    {/* Header */}
    <div className="flex gap-4 border-b border-gray-50 pb-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3.5 bg-gray-200 rounded-md flex-1" />
      ))}
    </div>
    {/* Body Rows */}
    {Array.from({ length: rows }).map((__, r) => (
      <div
        key={r}
        className="flex gap-4 py-3 border-b border-gray-50/50 items-center"
      >
        {Array.from({ length: cols }).map((___, c) => (
          <div key={c} className="h-5 bg-gray-100 rounded-lg flex-1" />
        ))}
      </div>
    ))}
  </div>
)

// Reusable Chart Skeleton Mockup
export const ChartSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-4.5 bg-gray-200 rounded-md w-32" />
        <div className="h-3 bg-gray-100 rounded-md w-48" />
      </div>
      <div className="h-7 bg-gray-200 rounded-lg w-16" />
    </div>
    <div className="h-48 flex items-end gap-3 pt-6 border-b border-l border-gray-50 pl-4 pb-2">
      {[40, 60, 45, 80, 55, 90, 70, 85].map((height, i) => (
        <div
          key={i}
          className="bg-gray-100/70 rounded-t-lg flex-1 transition-all duration-300"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  </div>
)

// Reusable Listings Grid Card Skeleton
export const ListingsGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl p-4 border border-gray-100 space-y-4"
      >
        <div className="aspect-[4/3] rounded-2xl bg-gray-150 w-full" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-250 rounded-md w-3/4" />
          <div className="h-3 bg-gray-150 rounded-md w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded-md w-16" />
          <div className="h-7 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>
    ))}
  </div>
)

// Unified Dashboard Full Page Loader (prevents layout shifting)
export const DashboardOverviewSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-300">
    {/* Page Title Header */}
    <div className="space-y-2.5">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="h-4 bg-gray-100 rounded-md w-96" />
    </div>

    {/* Stat cards grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Chart & lists row */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-md w-36" />
          <div className="h-3 bg-gray-100 rounded-md w-64" />
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-md w-28" />
          <div className="h-3 bg-gray-100 rounded-md w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-11 h-11 bg-gray-100 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
