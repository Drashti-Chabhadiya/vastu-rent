import { Skeleton } from '#/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse font-sans">
      {/* Page header */}
      <div className="mb-6 p-1 space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* UserProfileSettingsCard skeleton */}
      <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
      </div>

      {/* Grid for Security & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Security Card Skeleton */}
        <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-border/10 last:border-0"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Card Skeleton */}
        <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
            <div className="pt-2 border-t border-border/10 flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card Skeleton */}
      <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
      </div>

      {/* Member Banner Skeleton */}
      <div className="bg-primary-soft/50 rounded-[32px] border border-primary-border/30 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
            <Skeleton className="h-2.5 w-60 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-24 rounded shrink-0" />
      </div>
    </div>
  )
}
