import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { getBookingGroup } from '#/lib/booking-utils'

interface BookingStatusBadgeProps {
  status: string
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const group = getBookingGroup(status)

  switch (group) {
    case 'upcoming':
      return (
        <Badge
          className={cn(
            'bg-warning/25',
            'hover:bg-warning/25',
            'text-warning-foreground',
            'border-none',
            'px-3.5',
            'py-1',
            'rounded-full',
            'font-bold',
            'text-xs',
            'shrink-0',
            'shadow-sm',
            'shadow-warning-foreground/5',
          )}
        >
          Upcoming
        </Badge>
      )
    case 'ongoing':
      return (
        <Badge
          className={cn(
            'bg-info/25',
            'hover:bg-info/25',
            'text-info-foreground',
            'border-none',
            'px-3.5',
            'py-1',
            'rounded-full',
            'font-bold',
            'text-xs',
            'shrink-0',
            'shadow-sm',
          )}
        >
          Ongoing
        </Badge>
      )
    case 'completed':
      return (
        <Badge
          className={cn(
            'bg-primary-soft',
            'hover:bg-primary-soft',
            'text-primary',
            'border-none',
            'px-3.5',
            'py-1',
            'rounded-full',
            'font-bold',
            'text-xs',
            'shrink-0',
            'shadow-sm',
          )}
        >
          Completed
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge
          className={cn(
            'bg-danger',
            'hover:bg-danger',
            'text-danger-foreground',
            'border-none',
            'px-3.5',
            'py-1',
            'rounded-full',
            'font-bold',
            'text-xs',
            'shrink-0',
            'shadow-sm',
          )}
        >
          Cancelled
        </Badge>
      )
    default:
      return null
  }
}
