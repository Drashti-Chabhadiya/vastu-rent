import { Skeleton } from '#/components/ui/skeleton'

export function HeroSkeleton() {
  return (
    <div className="relative w-full max-w-[540px] aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card border border-border/30 shadow-2xl">
      <Skeleton className="absolute inset-0 rounded-none bg-muted/40" />
      
      {/* Top featured tag skeleton */}
      <Skeleton className="absolute left-5 top-5 h-8 w-48 rounded-full bg-muted/80" />
      
      {/* Bottom card skeleton */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-4 border border-border/40">
        <div className="flex-1 overflow-hidden pr-2 space-y-2.5">
          <Skeleton className="h-3 w-3/4 rounded bg-muted/80" />
          <Skeleton className="h-5 w-1/2 rounded bg-muted/80" />
          <Skeleton className="h-3 w-2/3 rounded bg-muted/80" />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Skeleton className="h-6 w-20 rounded bg-muted/80" />
          <Skeleton className="h-3 w-12 rounded bg-muted/80" />
        </div>
      </div>
    </div>
  )
}
