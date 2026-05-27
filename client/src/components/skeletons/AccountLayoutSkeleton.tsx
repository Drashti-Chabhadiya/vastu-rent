export function AccountLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16 pb-12 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-card rounded-[32px] border border-border/30 shadow-sm overflow-hidden p-6 animate-pulse">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-8 p-2">
                <div className="w-16 h-16 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded-lg w-3/4" />
                  <div className="h-3 bg-muted/50 rounded-lg w-full" />
                </div>
              </div>

              {/* Nav items */}
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted-light"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg bg-muted" />
                      <div
                        className={`h-3 bg-muted rounded-lg ${
                          i === 0
                            ? 'w-32'
                            : i === 1
                              ? 'w-24'
                              : i === 2
                                ? 'w-28'
                                : 'w-20'
                        }`}
                      />
                    </div>
                    <div className="w-4 h-4 rounded bg-muted/50" />
                  </div>
                ))}
                {/* Sign out row */}
                <div className="flex items-center gap-3 p-4 mt-4">
                  <div className="w-5 h-5 rounded-lg bg-muted/50" />
                  <div className="h-3 bg-muted/50 rounded-lg w-16" />
                </div>
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 min-w-0">
            <div className="bg-card rounded-[32px] border border-border/30 shadow-sm overflow-hidden min-h-[600px] p-8 animate-pulse">
              {/* Page title */}
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <div className="h-7 bg-muted rounded-lg w-52" />
                  <div className="h-4 bg-muted/50 rounded-lg w-72" />
                </div>
                <div className="h-10 w-28 bg-muted rounded-xl" />
              </div>

              {/* Avatar + info block */}
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                <div className="w-28 h-28 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-5 bg-muted rounded-lg w-40" />
                  <div className="h-3 bg-muted/50 rounded-lg w-24" />
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-muted/50 rounded w-24" />
                    <div className="h-11 bg-muted/50 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
