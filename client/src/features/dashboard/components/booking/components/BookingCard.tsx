import {
  Calendar,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
  Users,
  MessageSquare,
  Star,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { BookingStatusBadge } from './BookingStatusBadge'
import { getBookingGroup } from '#/lib/booking-utils'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

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
  const [imgError, setImgError] = useState(false)
  const imageUrl =
    !imgError && rental.product?.images?.[0] ? rental.product.images[0] : null

  const bookingGroup = getBookingGroup(rental.status)
  const hasReview = rental.product?.reviews && rental.product.reviews.length > 0

  return (
    <>
      {/* ─── MOBILE BOOKING CARD ─── */}
      <div className="flex md:hidden flex-col bg-card rounded-[20px] border border-border/20 shadow-xs overflow-hidden">
        {/* Top row: image + info */}
        <div className="flex gap-3.5 p-4">
          {/* Product Thumbnail */}
          <div className="w-[76px] h-[76px] rounded-xl overflow-hidden shrink-0 border border-border/10 bg-muted/40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={rental.product?.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-green-tint">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4a7c5a"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <h4 className="font-extrabold text-[13px] text-foreground leading-tight line-clamp-2 flex-1">
                {rental.product?.title}
              </h4>
              <div className="shrink-0 mt-0.5">
                <BookingStatusBadge status={rental.status} />
              </div>
            </div>
            <p className="text-[10.5px] font-semibold text-muted-foreground mt-1">
              {format(new Date(rental.startDate), 'd MMM')} –{' '}
              {format(new Date(rental.endDate), 'd MMM')} · {nights}{' '}
              {nights === 1 ? 'day' : 'days'}
            </p>
            <p className="text-[13px] font-black text-foreground mt-1.5">
              ₹{rental.totalPrice?.toLocaleString()}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">
                total
              </span>
            </p>
          </div>
        </div>

        {/* Action Row */}
        <div className="border-t border-border/15 flex">
          {/* Chat with host */}
          <Link
            to="/account/messages"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11.5px] font-bold text-muted-foreground hover:bg-muted-light/20 active:bg-muted-light/30 transition-all"
          >
            <MessageSquare size={12} strokeWidth={2.5} className="shrink-0" />
            Chat with host
          </Link>

          <div className="w-px bg-border/20" />

          {/* Contextual right action */}
          {bookingGroup === 'completed' && !hasReview ? (
            <button
              onClick={() => onOpenReview(rental)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11.5px] font-bold text-primary hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              <Star size={12} strokeWidth={2.5} className="shrink-0" />
              Write Review
            </button>
          ) : (
            <button
              onClick={() => onOpenDetails(rental)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11.5px] font-bold text-primary dark:text-emerald-500 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              View details
              <ChevronRight size={12} strokeWidth={2.5} className="shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* ─── DESKTOP BOOKING CARD ─── */}
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
          'hidden',
          'md:flex',
          'flex-row',
          'gap-6',
          'items-center',
          'relative',
        )}
      >
        {/* Wrapper to layout image & details in row on mobile/tablet, but act as normal items on desktop via sm:contents */}
        <div className="flex flex-row gap-4 items-center w-full sm:contents">
          {/* Product Image */}
          <div
            className={cn(
              'w-28',
              'h-28',
              'rounded-2xl',
              'overflow-hidden',
              'shrink-0',
              'bg-muted-light',
              'shadow-inner',
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={rental.product?.title}
                className={cn(
                  'w-full',
                  'h-full',
                  'object-cover',
                  'transition-transform',
                  'duration-500',
                  'group-hover:scale-105',
                )}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-green-tint">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4a7c5a"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Middle Details */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <h3
                className={cn(
                  'text-[17px]',
                  'font-black',
                  'text-foreground',
                  'leading-tight',
                  'line-clamp-2',
                )}
              >
                {rental.product?.title}
              </h3>
            </div>

            <div className="space-y-1">
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'gap-1.5',
                  'text-xs',
                  'font-bold',
                  'text-muted-foreground/85',
                )}
              >
                <Calendar size={13} className="text-muted-dark shrink-0" />
                <span className="truncate">
                  {format(new Date(rental.startDate), 'dd MMMM')} –{' '}
                  {format(new Date(rental.endDate), 'dd MMMM, yyyy')}{' '}
                  <span className="text-muted-dark font-extrabold text-xs">
                    ({nights} {nights === 1 ? 'Night' : 'Nights'})
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'gap-1.5',
                  'text-xs',
                  'font-bold',
                  'text-muted-foreground/85',
                )}
              >
                <Users size={13} className="text-muted-dark shrink-0" />
                <span className="truncate">
                  {rental.product?.category?.name || 'Vastu Rental'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stats & Buttons */}
        <div
          className={cn(
            'flex',
            'flex-col',
            'items-end',
            'gap-3.5',
            'shrink-0',
            'self-stretch',
            'justify-between',
            'text-right',
            'w-auto',
          )}
        >
          <div className="flex flex-col justify-start items-end gap-2">
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
                'justify-end',
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
              'justify-end',
              'gap-2.5',
              'w-auto',
              'flex-wrap',
            )}
          >
            <BookingStatusBadge status={rental.status} />

            {/* Review / Edit Review (completed) */}
            {bookingGroup === 'completed' && (
              <>
                {hasReview ? (
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
                      'hover:bg-primary/95',
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
            {bookingGroup !== 'cancelled' && (
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
    </>
  )
}
