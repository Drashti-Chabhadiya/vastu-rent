import { Skeleton } from '#/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse font-sans">
      {/* Page header */}
      <div className="mb-4 p-1">
        <Skeleton className="h-8 w-48 rounded-lg mb-2" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* Tabs Navigation Bar Skeleton (Desktop Only) */}
      <div className="hidden md:flex gap-6 sm:gap-8 border-b border-border/30 pb-px overflow-x-auto scrollbar-none mb-6">
        {[{ w: 'w-32' }, { w: 'w-32' }, { w: 'w-44' }, { w: 'w-36' }].map(
          (tab, i) => (
            <div key={i} className="pb-1 relative shrink-0">
              <div className="flex items-center gap-2 pb-2">
                <Skeleton className="w-[15px] h-[15px] rounded-full" />
                <Skeleton className={`h-4 ${tab.w} rounded`} />
              </div>
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20 rounded-full" />
              )}
            </div>
          ),
        )}
      </div>

      <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left User Summary Column Skeleton */}
          <div className="flex flex-col items-center border border-border/50 rounded-[24px] p-6 text-center shadow-sm">
            <Skeleton className="w-32 h-32 rounded-full mb-6" />
            <Skeleton className="h-6 w-32 rounded-lg mb-8" />

            <div className="w-full space-y-2 mb-8">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex flex-col gap-1.5 mt-2 text-left">
                <Skeleton className="h-2 w-24 rounded" />
                <Skeleton className="h-2 w-16 rounded" />
              </div>
            </div>

            <div className="w-full space-y-4">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>

          {/* Right Personal Information Form Column Skeleton */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-3.5 w-64 rounded-md hidden md:block" />
              </div>
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-[52px] w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
