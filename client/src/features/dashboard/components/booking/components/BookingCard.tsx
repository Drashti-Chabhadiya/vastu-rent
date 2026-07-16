import {
  Calendar,
  MapPin,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { BookingStatusBadge } from './BookingStatusBadge'
import { getBookingGroup } from '#/lib/booking-utils'

interface BookingCardProps {
  rental: any
  onOpenReview: (rental: any) => void
  onOpenDispute: (rental: any) => void
  onOpenDetails: (rental: any) => void
}

export function BookingCard({
  rental,
  onOpenReview,
  onOpenDispute,
  onOpenDetails,
}: BookingCardProps) {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(rental.endDate).getTime() -
        new Date(rental.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
    ),
  )

  return (
    <div
      className={cn(
        'group',
        'bg-card',
        'p-5',
        'sm:p-6',
        'rounded-[2.5rem]',
        'border',
        'border-border/30',
        'shadow-sm',
        'hover:shadow-md',
        'transition-all',
        'duration-300',
        'flex',
        'flex-col',
        'sm:flex-row',
        'gap-5',
        'sm:gap-6',
        'items-start',
        'sm:items-center',
        'relative',
      )}
    >
      {/* Wrapper to layout image & details in row on mobile/tablet, but act as normal items on desktop via sm:contents */}
      <div className="flex flex-row gap-4 items-center w-full sm:contents">
        {/* Product Image */}
        <div
          className={cn(
            'w-20',
            'h-20',
            'xs:w-24',
            'xs:h-24',
            'sm:w-28',
            'sm:h-28',
            'md:w-32',
            'md:h-32',
            'rounded-2xl',
            'overflow-hidden',
            'shrink-0',
            'bg-muted-light',
            'shadow-inner',
          )}
        >
          <img
            src={
              rental.product?.images?.[0] || 'https://placehold.co/128?text=Vastu'
            }
            alt={rental.product?.title}
            className={cn(
              'w-full',
              'h-full',
              'object-cover',
              'transition-transform',
              'duration-500',
              'group-hover:scale-105',
            )}
          />
        </div>

        {/* Middle Details */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-4">
          <div>
            <h3
              className={cn(
                'text-[14px]',
                'xs:text-base',
                'sm:text-[17px]',
                'font-black',
                'text-foreground',
                'leading-tight',
                'line-clamp-2',
              )}
            >
              {rental.product?.title}
            </h3>
            <div
              className={cn(
                'flex',
                'items-center',
                'gap-1',
                'text-[10px]',
                'xs:text-[11px]',
                'font-bold',
                'text-muted-dark',
                'mt-1',
              )}
            >
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="truncate">
                {rental.product?.location ||
                  rental.product?.city ||
                  'Surat, India'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div
              className={cn(
                'flex',
                'items-center',
                'gap-1.5',
                'text-[11px]',
                'xs:text-xs',
                'font-bold',
                'text-muted-foreground/85',
              )}
            >
              <Calendar size={13} className="text-muted-dark shrink-0" />
              <span className="truncate">
                {format(new Date(rental.startDate), 'dd MMMM')} –{' '}
                {format(new Date(rental.endDate), 'dd MMMM, yyyy')}{' '}
                <span className="text-muted-dark font-extrabold text-[10px] xs:text-xs">
                  ({nights} {nights === 1 ? 'Night' : 'Nights'})
                </span>
              </span>
            </div>
            <div
              className={cn(
                'flex',
                'items-center',
                'gap-1.5',
                'text-[11px]',
                'xs:text-xs',
                'font-bold',
                'text-muted-foreground/85',
              )}
            >
              <Users size={13} className="text-muted-dark shrink-0" />
              <span className="truncate">{rental.product?.category?.name || 'Vastu Rental'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Stats & Buttons */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'items-start',
          'sm:items-end',
          'gap-3.5',
          'shrink-0',
          'self-stretch',
          'justify-between',
          'sm:text-right',
          'border-t',
          'sm:border-t-0',
          'border-border/30',
          'pt-4',
          'sm:pt-0',
          'w-full',
          'sm:w-auto',
        )}
      >
        <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full sm:w-auto gap-2">
          <p
            className={cn(
              'text-[10px]',
              'text-muted-dark',
              'font-extrabold',
              'uppercase',
              'tracking-wider',
            )}
          >
            Booking ID:{' '}
            <span className={cn('font-mono', 'text-muted-foreground/85')}>
              #BK{rental.id.slice(-6).toUpperCase()}
            </span>
          </p>
          <div
            className={cn(
              'flex',
              'items-center',
              'sm:justify-end',
              'gap-1.5',
              'text-xs',
              'font-bold',
              'text-muted-foreground/85',
            )}
          >
            <span className={cn('text-muted-dark', 'font-extrabold')}>
              Total Amount
            </span>
            <span
              className={cn(
                'text-base',
                'font-black',
                'text-foreground',
                'flex',
                'items-center',
              )}
            >
              <IndianRupee size={14} className="stroke-[3]" />
              {rental.totalPrice?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            'flex',
            'items-center',
            'justify-start',
            'sm:justify-end',
            'gap-2.5',
            'w-full',
            'sm:w-auto',
            'flex-wrap',
          )}
        >
          <BookingStatusBadge status={rental.status} />

          {/* Review / Edit Review (completed) */}
          {getBookingGroup(rental.status) === 'completed' && (
            <>
              {rental.product?.reviews && rental.product.reviews.length > 0 ? (
                <div
                  className={cn('flex', 'items-center', 'gap-2', 'flex-wrap')}
                >
                  <Badge
                    className={cn(
                      'bg-brand-green-bubble/50',
                      'hover:bg-brand-green-bubble/50',
                      'text-primary',
                      'border-none',
                      'px-3.5',
                      'py-1.5',
                      'rounded-full',
                      'font-bold',
                      'text-xs',
                      'shrink-0',
                      'shadow-sm',
                      'flex',
                      'items-center',
                      'gap-1.5',
                    )}
                  >
                    <CheckCircle2 size={12} className="text-primary" />
                    Review Submitted
                  </Badge>

                  {(() => {
                    const review = rental.product.reviews[0]
                    const diffDays =
                      (new Date().getTime() -
                        new Date(review.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)

                    if (diffDays <= 7) {
                      return (
                        <Button
                          onClick={() => {
                            onOpenReview(rental)
                          }}
                          className={cn(
                            'rounded-full',
                            'bg-brand-green-tint',
                            'hover:bg-brand-green-bubble',
                            'text-primary',
                            'font-black',
                            'text-[11px]',
                            'px-3.5',
                            'h-8',
                            'flex',
                            'items-center',
                            'justify-center',
                            'border',
                            'border-primary/15',
                            'active:scale-95',
                            'transition-all',
                            'cursor-pointer',
                            'shadow-sm',
                          )}
                        >
                          Edit Review
                        </Button>
                      )
                    }
                    return null
                  })()}
                </div>
              ) : (
                <Button
                  onClick={() => onOpenReview(rental)}
                  className={cn(
                    'rounded-full',
                    'bg-primary',
                    'hover:bg-primary-hover',
                    'text-primary-foreground',
                    'font-extrabold',
                    'text-xs',
                    'px-4',
                    'h-9',
                    'flex',
                    'items-center',
                    'justify-center',
                    'shadow-sm',
                    'active:scale-95',
                    'cursor-pointer',
                  )}
                >
                  Write Review
                </Button>
              )}
            </>
          )}

          {/* Dispute Button */}
          {getBookingGroup(rental.status) !== 'cancelled' && (
            <Button
              onClick={() => onOpenDispute(rental)}
              variant="outline"
              className={cn(
                'rounded-full',
                'border-danger/30',
                'text-danger-foreground',
                'hover:bg-danger/10',
                'font-extrabold',
                'text-xs',
                'px-4',
                'h-9',
                'flex',
                'items-center',
                'justify-center',
                'shadow-sm',
                'active:scale-95',
                'cursor-pointer',
              )}
            >
              Report Dispute
            </Button>
          )}

          {/* View Details */}
          <Button
            variant="outline"
            onClick={() => onOpenDetails(rental)}
            className={cn(
              'rounded-full',
              'border-border',
              'text-primary',
              'font-black',
              'text-xs',
              'px-4',
              'h-9',
              'flex',
              'items-center',
              'gap-1',
              'hover:bg-muted-light/50',
              'shadow-sm',
              'active:scale-95',
              'cursor-pointer',
            )}
          >
            View Details
            <ChevronRight
              size={14}
              className={cn('text-primary', 'stroke-[3]')}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
