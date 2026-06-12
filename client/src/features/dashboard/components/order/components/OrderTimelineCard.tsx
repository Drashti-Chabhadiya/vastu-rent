import { CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '#/lib/utils'

interface OrderTimelineCardProps {
  order: any
}

export const OrderTimelineCard = ({ order }: OrderTimelineCardProps) => {
  const getTimelineSteps = () => {
    const isCancelledOrRejected = order.status === 'cancelled' || order.status === 'rejected'

    const steps = [
      {
        title: 'Order Placed',
        description: 'Order has been placed by renter.',
        date: order.createdAt,
        status: 'completed',
        icon: CheckCircle2,
        color: 'bg-primary',
      },
      {
        title: isCancelledOrRejected ? 'Rejected / Cancelled' : 'Confirmed',
        description: isCancelledOrRejected
          ? 'This booking request was rejected or cancelled.'
          : order.status === 'confirmed' || order.status === 'picked_up' || order.status === 'completed'
            ? 'Booking confirmed by lister.'
            : 'Waiting for lister approval & confirmation.',
        date:
          order.status === 'confirmed' || order.status === 'picked_up' || order.status === 'completed' || isCancelledOrRejected
            ? order.updatedAt || order.createdAt
            : null,
        status:
          order.status === 'confirmed' || order.status === 'picked_up' || order.status === 'completed' || isCancelledOrRejected
            ? 'completed'
            : 'pending',
        icon: isCancelledOrRejected ? XCircle : CheckCircle2,
        color: isCancelledOrRejected ? 'bg-destructive' : 'bg-primary',
      },
      {
        title: 'Picked Up',
        description:
          order.status === 'picked_up' || order.status === 'completed'
            ? 'Product picked up and handed over to renter.'
            : 'Waiting for physical hand-off & verification.',
        date: order.status === 'picked_up' || order.status === 'completed' ? order.updatedAt : null,
        status:
          order.status === 'picked_up' || order.status === 'completed'
            ? 'completed'
            : isCancelledOrRejected
              ? 'upcoming'
              : 'pending',
        icon: CheckCircle2,
        color: order.status === 'picked_up' || order.status === 'completed' ? 'bg-primary' : 'bg-muted/50',
      },
      {
        title: 'Completed',
        description: 'Rental completed and product was returned to lister.',
        date: order.status === 'completed' ? order.updatedAt : null,
        status: order.status === 'completed' ? 'completed' : 'upcoming',
        icon: CheckCircle2,
        color: order.status === 'completed' ? 'bg-primary' : 'bg-muted/50',
      },
    ]
    return steps
  }

  return (
    <div className="bg-card p-10 rounded-[2rem] border border-border/30 shadow-sm">
      <h3 className="text-[14px] font-black text-foreground mb-10 uppercase tracking-widest">
        Order Timeline
      </h3>
      <div className="relative space-y-12 pl-12">
        {/* Timeline Dashed Line */}
        <div className="absolute left-5 top-2 bottom-2 w-0 border-l border-dashed border-border"></div>

        {getTimelineSteps().map((step, i) => {
          const Icon = step.icon
          const isUpcoming = step.status === 'upcoming'
          const isPending = step.status === 'pending'

          return (
            <div key={i} className={cn('relative', isUpcoming && 'opacity-30')}>
              <div
                className={cn(
                  'absolute -left-12 w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground z-10 shadow-lg',
                  step.color,
                  isUpcoming &&
                    'border border-border/30 text-muted-dark shadow-none bg-muted-light',
                  isPending && 'shadow-amber-100',
                )}
              >
                <Icon
                  size={18}
                  className={
                    isUpcoming ? 'text-muted-dark' : 'text-primary-foreground'
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-black text-foreground">
                  {step.title}
                </p>
                {step.date ? (
                  <p className="text-[11px] font-bold text-muted-dark">
                    {format(new Date(step.date), 'dd MMM yyyy, hh:mm a')}
                  </p>
                ) : (
                  <p className="text-[11px] font-bold text-muted-dark">
                    {isUpcoming ? 'Upcoming Stage' : 'Pending Approval'}
                  </p>
                )}
                <p className="text-[11px] font-medium text-muted-foreground/85">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
