import { Skeleton } from '#/components/ui/skeleton'

export function ProductCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'mini'
}) {
  if (variant === 'mini') {
    return (
      <div className="w-full h-full shrink-0 bg-card border border-border/15 rounded-[20px] overflow-hidden flex flex-col justify-between shadow-3xs">
        <div className="relative h-[100px] w-full bg-muted">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute bottom-2 left-2 z-10">
            <Skeleton className="h-4 w-16 rounded-md bg-foreground/20" />
          </div>
          <div className="absolute top-2 right-2 z-10">
            <Skeleton className="h-6 w-6 rounded-full bg-foreground/20" />
          </div>
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-3/4 rounded-md" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-2 w-2 rounded-full shrink-0" />
              <Skeleton className="h-2 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3.5 w-12 rounded-md" />
            <Skeleton className="h-2.5 w-6 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-[24px] md:rounded-[32px] p-3 md:p-4 border border-border/40 shadow-xs flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] rounded-[16px] md:rounded-[24px] overflow-hidden bg-muted shrink-0">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute bottom-3 left-3 z-10">
          <Skeleton className="h-6 w-24 rounded-lg bg-foreground/20" />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Skeleton className="h-9 w-9 rounded-full bg-foreground/20" />
        </div>
      </div>

      <div className="mt-3 md:mt-4 space-y-2 flex-1">
        <Skeleton className="h-5 w-[85%] rounded-lg" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
      </div>

      <div className="mt-3 md:mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>

      <div className="mt-4 shrink-0">
        <Skeleton className="h-10 md:h-12 w-full rounded-xl md:rounded-2xl" />
      </div>
    </div>
  )
}
