import { cn } from '#/lib/utils'

export const MyBookingsSkeleton = () => {
  return (
    <div className={cn('space-y-8', 'animate-pulse')}>
      <div className={cn('flex', 'justify-between', 'items-center')}>
        <div className="space-y-2">
          <div className={cn('h-8', 'bg-muted', 'rounded-full', 'w-48')} />
          <div className={cn('h-4', 'bg-muted/50', 'rounded-full', 'w-80')} />
        </div>
        <div className={cn('h-10', 'bg-muted', 'rounded-full', 'w-24')} />
      </div>
      <div
        className={cn('flex', 'gap-6', 'border-b', 'border-border/30', 'pb-2')}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn('h-5', 'bg-muted', 'rounded-full', 'w-20')} />
        ))}
      </div>
      <div className={cn('grid', 'gap-4')}>
        {[1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-card', 'p-6', 'rounded-[2.5rem]', 'border', 'border-border/30',
              'shadow-sm', 'flex', 'flex-col', 'md:flex-row', 'gap-6',
            )}
          >
            <div className={cn('w-32', 'h-32', 'rounded-2xl', 'bg-muted/50', 'shrink-0')} />
            <div className={cn('flex-1', 'space-y-3')}>
              <div className={cn('h-5', 'bg-muted', 'rounded-full', 'w-48')} />
              <div className={cn('h-4', 'bg-muted-light/80', 'rounded-full', 'w-32')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
