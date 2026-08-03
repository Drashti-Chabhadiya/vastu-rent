import { Skeleton } from '#/components/ui/skeleton'

export function CategoryIconSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'mini'
}) {
  if (variant === 'mini') {
    return (
      <div className="flex flex-col items-center gap-2 shrink-0 w-[72px]">
        <Skeleton className="w-[64px] h-[64px] rounded-[24px] border border-border/10 shrink-0" />
        <Skeleton className="h-2.5 w-10 rounded mt-1" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Category Circle/Badge Skeleton */}
      <Skeleton className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-2xl sm:rounded-3xl" />
      {/* Category Label Skeleton */}
      <Skeleton className="w-16 h-3 rounded" />
    </div>
  )
}
