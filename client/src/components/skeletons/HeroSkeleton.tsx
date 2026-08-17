import { Skeleton } from '#/components/ui/skeleton'

export function HeroSkeleton() {
  return (
    <div className="relative w-full max-w-[540px] aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card border border-border/30 shadow-2xl">
      <Skeleton className="absolute inset-0 rounded-none bg-muted/40" />

      {/* Sliding Dots Indicators Skeleton */}
      <div className="absolute top-5 right-5 z-30 flex gap-1 bg-black/45 backdrop-blur-xs py-1.5 px-3 rounded-full">
        <Skeleton className="h-1.5 w-3.5 rounded-full bg-white" />
        <Skeleton className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <Skeleton className="h-1.5 w-1.5 rounded-full bg-white/40" />
      </div>

      {/* Bottom floating product details skeleton */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-4 backdrop-blur-md border border-border/40 shadow-lg">
        <div className="flex-1 overflow-hidden pr-2 space-y-2.5">
          <Skeleton className="h-2.5 w-24 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
        </div>
      </div>
    </div>
  )
}
