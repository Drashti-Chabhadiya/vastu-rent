import { Calendar, MapPin, IndianRupee, ChevronRight, CheckCircle2, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { BookingStatusBadge, getBookingGroup } from './BookingStatusBadge'

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
        'p-6',
        'rounded-[2.5rem]',
        'border',
        'border-border/30',
        'shadow-sm',
        'hover:shadow-md',
        'transition-all',
        'duration-300',
        'flex',
        'flex-col',
        'md:flex-row',
        'gap-6',
        'items-start',
        'md:items-center',
        'relative',
      )}
    >
      {/* Product Image */}
      <div
        className={cn(
          'w-32',
          'h-32',
          'rounded-2xl',
          'overflow-hidden',
          'shrink-0',
          'bg-muted-light',
          'shadow-inner',
        )}
      >
        <img
          src={
            rental.product?.images?.[0] ||
            'https://placehold.co/128?text=Vastu'
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
      <div className={cn('flex-1', 'space-y-4')}>
        <div>
          <h3
            className={cn(
              'text-[17px]',
              'font-black',
              'text-foreground',
              'leading-tight',
            )}
          >
            {rental.product?.title}
          </h3>
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-1',
              'text-[11px]',
              'font-bold',
              'text-muted-dark',
              'mt-1',
            )}
          >
            <MapPin size={12} className="text-primary" />
            <span>
              {rental.product?.location ||
                rental.product?.city ||
                'Ahmedabad, India'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'text-xs',
              'font-bold',
              'text-muted-foreground/85',
            )}
          >
            <Calendar size={13} className="text-muted-dark" />
            <span>
              {format(new Date(rental.startDate), 'dd MMMM')} –{' '}
              {format(new Date(rental.endDate), 'dd MMMM, yyyy')}{' '}
              <span className="text-muted-dark">
                ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </span>
            </span>
          </div>
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'text-xs',
              'font-bold',
              'text-muted-foreground/85',
            )}
          >
            <Users size={13} className="text-muted-dark" />
            <span>
              {rental.product?.category?.name || 'Vastu Rental'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Stats & Buttons */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'items-start',
          'md:items-end',
          'gap-3',
          'shrink-0',
          'self-stretch',
          'justify-between',
          'md:text-right',
          'border-t',
          'md:border-t-0',
          'border-border/30',
          'pt-4',
          'md:pt-0',
          'w-full',
          'md:w-auto',
        )}
      >
        <div className="space-y-1">
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
              'md:justify-end',
              'gap-1.5',
              'text-xs',
              'font-bold',
              'text-muted-foreground/85',
              'mt-1',
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
            'md:justify-end',
            'gap-3',
            'w-full',
            'md:w-auto',
            'flex-wrap',
            'md:flex-nowrap',
          )}
        >
          <BookingStatusBadge status={rental.status} />

          {/* Review / Edit Review (completed) */}
          {getBookingGroup(rental.status) === 'completed' && (
            <>
              {rental.product?.reviews && rental.product.reviews.length > 0 ? (
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'gap-2',
                    'flex-wrap',
                  )}
                >
                  <Badge
                    className={cn(
                      'bg-[#f0f9eb]',
                      'hover:bg-[#f0f9eb]',
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
                            'bg-[#f4f7f4]',
                            'hover:bg-[#eaf0ea]',
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
            <ChevronRight size={14} className={cn('text-primary', 'stroke-[3]')} />
          </Button>
        </div>
      </div>
    </div>
  )
}
