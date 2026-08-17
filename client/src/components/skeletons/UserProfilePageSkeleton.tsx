import { Skeleton } from '#/components/ui/skeleton'

export function UserProfilePageSkeleton() {
  return (
    <div className="min-h-full bg-background md:bg-surface pt-0 md:pt-20 md:pb-16 relative w-full font-sans">
      {/* Mobile Banner Background Image Skeleton */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-56 z-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Mobile Custom Header Nav Skeleton */}
      <div className="md:hidden absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      <div className="mx-auto max-w-[1240px] px-0 md:px-6 relative z-10 pt-32 md:pt-4">
        {/* Desktop Cover Banner Header Skeleton */}
        <div className="hidden md:block h-64 lg:h-72 w-full rounded-[32px] relative mb-[-72px] z-0">
          <Skeleton className="w-full h-full rounded-[32px]" />
        </div>

        {/* Profile Main Card Skeleton */}
        <div className="bg-card rounded-t-[36px] md:rounded-[36px] px-5 pb-6 pt-5 md:p-10 shadow-sm border-t md:border border-border/40 mb-6 md:mb-8 relative z-10">
          {/* Avatar + Info Header Block */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10">
            <div className="flex flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 min-w-0 flex-1">
              {/* Avatar Circle protruding above card top */}
              <div className="relative -mt-14 md:-mt-20 shrink-0">
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-card" />
              </div>

              {/* Name + Badges + Rating Column */}
              <div className="flex-1 min-w-0 text-left pt-1 md:pt-0 space-y-3">
                <Skeleton className="h-8 md:h-10 w-48 md:w-64 rounded-lg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32 md:w-48 rounded" />
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons Row */}
            <div className="hidden md:flex items-center gap-3 shrink-0 self-center md:self-end mt-2 md:mt-0">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>

          {/* 3-Column Metadata Card Skeleton */}
          <div className="grid grid-cols-3 border border-border rounded-[20px] p-3.5 bg-surface/50 mt-6 divide-x divide-border">
            <div className="flex items-center gap-2 px-1 sm:px-2 md:px-4">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-3 md:h-4 w-20 rounded" />
                <Skeleton className="h-2 w-10 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-1 sm:px-2 md:px-4">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-2 w-16 rounded" />
                <Skeleton className="h-3 md:h-4 w-24 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-1 sm:px-2 md:px-4">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-2 w-16 rounded" />
                <Skeleton className="h-3 md:h-4 w-12 rounded" />
              </div>
            </div>
          </div>

          {/* About Card & Highlight Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-6 mt-4 md:mt-6">
            <div className="border border-border rounded-[20px] p-4 md:p-5 bg-surface/50 space-y-3">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-[90%] rounded" />
              <Skeleton className="h-4 w-[60%] rounded" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="border border-border bg-surface/50 p-4 rounded-[20px] space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <div className="border border-border bg-surface/50 p-4 rounded-[20px] space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* User Active Listings Section Skeleton */}
        <div className="px-5 md:px-0 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-3xl p-3 border border-border/30 h-[280px] md:h-[320px]"
              >
                <Skeleton className="w-full h-3/5 rounded-2xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Extra spacer for mobile floating bottom bar */}
        <div className="h-48 md:hidden" />
      </div>

      {/* Mobile Sticky Floating bottom Action Bar Skeleton */}
      <div className="md:hidden fixed bottom-[calc(72px+max(env(safe-area-inset-bottom),8px)+12px)] left-4 right-4 flex gap-3 z-50">
        <Skeleton className="h-14 flex-1 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      </div>
    </div>
  )
}
