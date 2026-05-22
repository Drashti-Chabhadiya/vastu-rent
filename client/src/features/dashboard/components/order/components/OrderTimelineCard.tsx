import { CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '#/lib/utils'

interface OrderTimelineCardProps {
  order: any
}

export const OrderTimelineCard = ({ order }: OrderTimelineCardProps) => {
  const getTimelineSteps = () => {
    const steps = [
      {
        title: 'Order Placed',
        description: 'Order has been placed by customer.',
        date: order.createdAt,
        status: 'completed',
        icon: CheckCircle2,
        color: 'bg-[#059669]',
      },
      {
        title:
          order.status === 'cancelled' || order.status === 'rejected'
            ? 'Rejected / Cancelled'
            : 'Confirmed',
        description:
          order.status === 'cancelled' || order.status === 'rejected'
            ? 'This booking request was rejected.'
            : order.status === 'confirmed' ||
              order.status === 'active' ||
              order.status === 'completed'
              ? 'Booking confirmed and active.'
              : 'Waiting for owner approval & confirmation.',
        date:
          order.status === 'confirmed' ||
          order.status === 'active' ||
          order.status === 'completed' ||
          order.status === 'cancelled' ||
          order.status === 'rejected'
            ? order.updatedAt || order.createdAt
            : null,
        status:
          order.status === 'confirmed' ||
          order.status === 'active' ||
          order.status === 'completed' ||
          order.status === 'cancelled' ||
          order.status === 'rejected'
            ? 'completed'
            : 'pending',
        icon:
          order.status === 'cancelled' || order.status === 'rejected'
            ? XCircle
            : CheckCircle2,
        color:
          order.status === 'cancelled' || order.status === 'rejected'
            ? 'bg-red-500'
            : order.status === 'confirmed' ||
              order.status === 'active' ||
              order.status === 'completed'
              ? 'bg-[#059669]'
              : 'bg-[#f59e0b]',
      },
      {
        title: 'Completed',
        description: 'Rental period has ended and product was returned.',
        date:
          order.status === 'completed'
            ? order.updatedAt || order.createdAt
            : null,
        status: order.status === 'completed' ? 'completed' : 'upcoming',
        icon: CheckCircle2,
        color: order.status === 'completed' ? 'bg-[#059669]' : 'bg-slate-100',
      },
    ]
    return steps
  }

  return (
    <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
      <h3 className="text-[14px] font-black text-[#1e293b] mb-10 uppercase tracking-widest">
        Order Timeline
      </h3>
      <div className="relative space-y-12 pl-12">
        {/* Timeline Dashed Line */}
        <div className="absolute left-5 top-2 bottom-2 w-0 border-l border-dashed border-slate-200"></div>

        {getTimelineSteps().map((step, i) => {
          const Icon = step.icon
          const isUpcoming = step.status === 'upcoming'
          const isPending = step.status === 'pending'

          return (
            <div
              key={i}
              className={cn('relative', isUpcoming && 'opacity-30')}
            >
              <div
                className={cn(
                  'absolute -left-12 w-10 h-10 rounded-full flex items-center justify-center text-white z-10 shadow-lg',
                  step.color,
                  isUpcoming &&
                    'border border-slate-100 text-slate-300 shadow-none bg-slate-50',
                  isPending && 'shadow-amber-100',
                )}
              >
                <Icon
                  size={18}
                  className={isUpcoming ? 'text-slate-300' : 'text-white'}
                />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-black text-[#1e293b]">
                  {step.title}
                </p>
                {step.date ? (
                  <p className="text-[11px] font-bold text-slate-400">
                    {format(new Date(step.date), 'dd MMM yyyy, hh:mm a')}
                  </p>
                ) : (
                  <p className="text-[11px] font-bold text-slate-400">
                    {isUpcoming ? 'Upcoming Stage' : 'Pending Approval'}
                  </p>
                )}
                <p className="text-[11px] font-medium text-slate-500">
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
