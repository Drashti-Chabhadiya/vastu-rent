import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { IndianRupee, Users, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '#/lib/utils'
import { BookingStatusBadge } from './BookingStatusBadge'

interface BookingDetailsDialogProps {
  open: boolean
  onClose: () => void
  rental: any
}

export function BookingDetailsDialog({
  open,
  onClose,
  rental,
}: BookingDetailsDialogProps) {
  if (!rental) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-xl',
          'p-0',
          'border-none',
          'bg-muted-light',
          'rounded-[2.5rem]',
          'shadow-2xl',
          'font-sans',
          'overflow-hidden',
        )}
      >
        {/* Top Product Banner */}
        <div className={cn('relative', 'h-44', 'bg-foreground')}>
          {rental.product?.images?.[0] && (
            <img
              src={rental.product.images[0]}
              alt=""
              className={cn('w-full', 'h-full', 'object-cover', 'opacity-60')}
            />
          )}
          <div
            className={cn(
              'absolute',
              'inset-0',
              'bg-gradient-to-t',
              'from-slate-900',
              'via-slate-900/40',
              'to-transparent',
            )}
          />
          <div
            className={cn(
              'absolute',
              'bottom-6',
              'left-6',
              'right-6',
              'flex',
              'items-end',
              'justify-between',
            )}
          >
            <div>
              <span
                className={cn(
                  'text-[9px]',
                  'font-black',
                  'uppercase',
                  'tracking-widest',
                  'text-primary',
                  'bg-primary-soft',
                  'px-2',
                  'py-1',
                  'rounded-md',
                  'border',
                  'border-primary-border',
                )}
              >
                {rental.product?.category?.name || 'Vastu Rental'}
              </span>
              <h3
                className={cn(
                  'text-xl',
                  'font-extrabold',
                  'text-primary-foreground',
                  'leading-tight',
                  'font-display',
                  'mt-2.5',
                )}
              >
                {rental.product?.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className={cn(
            'p-6',
            'space-y-5',
            'max-h-[80vh]',
            'overflow-y-auto',
            'custom-scrollbar',
          )}
        >
          {/* Status */}
          <div className={cn('grid', 'grid-cols-2', 'gap-4')}>
            <div
              className={cn(
                'bg-card',
                'p-4',
                'rounded-2xl',
                'border',
                'border-border/30/80',
                'space-y-1',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-muted-dark',
                  'uppercase',
                  'tracking-widest',
                  'block',
                )}
              >
                Lister Details
              </span>
              <div
                className={cn(
                  'text-xs',
                  'font-bold',
                  'text-foreground/90',
                  'flex',
                  'items-center',
                  'gap-1.5',
                  'pt-0.5',
                )}
              >
                <Users size={12} className="text-muted-dark" />
                <span>{rental.product?.user?.name || 'Vastu Lister'}</span>
              </div>
              <span
                className={cn(
                  'text-[10px]',
                  'font-medium',
                  'text-muted-dark',
                  'block',
                  'truncate',
                )}
              >
                {rental.product?.location ||
                  rental.product?.city ||
                  'Surat, India'}
              </span>
            </div>

            <div
              className={cn(
                'bg-card',
                'p-4',
                'rounded-2xl',
                'border',
                'border-border/30/80',
                'space-y-1',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-muted-dark',
                  'uppercase',
                  'tracking-widest',
                  'block',
                )}
              >
                Booking Status
              </span>
              <div className={cn('flex', 'gap-1.5', 'items-center', 'pt-0.5')}>
                <BookingStatusBadge status={rental.status} />
              </div>
              <span
                className={cn(
                  'text-[10px]',
                  'font-extrabold',
                  'uppercase',
                  'text-muted-dark',
                  'block',
                  'tracking-tight',
                  'pt-1',
                )}
              >
                ID: #BK{rental.id?.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* OTP Section */}
          {(rental.status === 'pending' ||
            rental.status === 'confirmed' ||
            rental.status === 'picked_up' ||
            rental.status === 'in_use') && (
              <div
                className={cn(
                  'bg-brand-cream-light',
                  'p-4.5',
                  'rounded-2xl',
                  'border',
                  'border-primary-border',
                  'space-y-2',
                )}
              >
                <span
                  className={cn(
                    'text-[8px]',
                    'font-black',
                    'text-primary',
                    'uppercase',
                    'tracking-widest',
                    'block',
                  )}
                >
                  🛡️ Verification Security OTP
                </span>
                <div className={cn('flex', 'items-center', 'justify-between')}>
                  <div>
                    <p
                      className={cn('text-xs', 'font-bold', 'text-foreground/80')}
                    >
                      {rental.status === 'pending' ||
                        rental.status === 'confirmed'
                        ? 'Pickup Verification OTP'
                        : 'Return Verification OTP'}
                    </p>
                    <p
                      className={cn(
                        'text-[10px]',
                        'text-muted-dark',
                        'font-medium',
                        'mt-0.5',
                      )}
                    >
                      Share this OTP with the host upon physical verification.
                    </p>
                  </div>
                  <div
                    className={cn(
                      'bg-primary/5',
                      'border',
                      'border-primary/20',
                      'px-3.5',
                      'py-1.5',
                      'rounded-xl',
                      'font-mono',
                      'font-black',
                      'text-sm',
                      'text-primary',
                    )}
                  >
                    {rental.status === 'pending' || rental.status === 'confirmed'
                      ? rental.pickupOTP || '— — —'
                      : rental.returnOTP || '— — —'}
                  </div>
                </div>
              </div>
            )}

          {/* Rental Period */}
          <div
            className={cn(
              'bg-card',
              'p-4.5',
              'rounded-2xl',
              'border',
              'border-border/30/80',
              'space-y-3',
            )}
          >
            <span
              className={cn(
                'text-[8px]',
                'font-black',
                'text-muted-dark',
                'uppercase',
                'tracking-widest',
                'block',
              )}
            >
              Rental Period
            </span>
            <div
              className={cn(
                'flex',
                'items-center',
                'justify-between',
                'text-xs',
                'font-bold',
                'text-foreground/80',
              )}
            >
              <div className={cn('flex', 'flex-col')}>
                <span
                  className={cn('text-[9px]', 'text-muted-dark', 'uppercase')}
                >
                  From
                </span>
                <span className="mt-0.5">
                  {rental.startDate &&
                    format(new Date(rental.startDate), 'dd MMM yyyy')}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={cn('text-muted-dark', 'mt-2')}
              />
              <div className={cn('flex', 'flex-col', 'text-right')}>
                <span
                  className={cn('text-[9px]', 'text-muted-dark', 'uppercase')}
                >
                  To
                </span>
                <span className="mt-0.5">
                  {rental.endDate &&
                    format(new Date(rental.endDate), 'dd MMM yyyy')}
                </span>
              </div>
            </div>
            <div
              className={cn(
                'border-t',
                'border-border/30',
                'pt-2.5',
                'flex',
                'items-center',
                'justify-between',
                'text-[11px]',
                'font-bold',
                'text-muted-foreground/85',
              )}
            >
              <span>Total Duration</span>
              <span className={cn('text-primary', 'font-black')}>
                {rental.startDate &&
                  rental.endDate &&
                  Math.max(
                    1,
                    Math.ceil(
                      (new Date(rental.endDate).getTime() -
                        new Date(rental.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                    ),
                  )}{' '}
                Nights
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            className={cn(
              'bg-card',
              'p-4.5',
              'rounded-2xl',
              'border',
              'border-border/30/80',
              'space-y-2',
              'text-xs',
              'font-semibold',
              'text-muted-foreground/85',
            )}
          >
            <span
              className={cn(
                'text-[8px]',
                'font-black',
                'text-muted-dark',
                'uppercase',
                'tracking-widest',
                'block',
                'mb-1',
              )}
            >
              Payment & Billing Details
            </span>
            <div className={cn('flex', 'justify-between')}>
              <span>Daily Rent Rate</span>
              <span className={cn('text-foreground/90', 'font-bold')}>
                ₹{rental.product?.price?.toLocaleString()}
              </span>
            </div>
            <div className={cn('flex', 'justify-between')}>
              <span>Rental Fee</span>
              <span className={cn('text-foreground/90', 'font-bold')}>
                ₹{rental.rentalFee?.toLocaleString()}
              </span>
            </div>
            <div className={cn('flex', 'justify-between')}>
              <span>Refundable Security Deposit</span>
              <span className={cn('text-foreground/90', 'font-bold')}>
                ₹{rental.depositAmount?.toLocaleString() || '₹0'}
              </span>
            </div>
            {rental.coupon && (
              <div
                className={cn(
                  'flex',
                  'justify-between',
                  'text-emerald-600',
                  'font-bold',
                )}
              >
                <span>Coupon Discount ({rental.coupon.code})</span>
                <span>
                  - ₹
                  {(
                    rental.rentalFee +
                    rental.depositAmount -
                    rental.totalPrice
                  ).toLocaleString()}
                </span>
              </div>
            )}
            <div
              className={cn(
                'flex',
                'justify-between',
                'text-[13px]',
                'font-black',
                'text-primary',
                'border-t',
                'border-border/30',
                'pt-2.5',
              )}
            >
              <span>Total Amount Paid</span>
              <span className={cn('flex', 'items-center')}>
                <IndianRupee size={12} className="stroke-[3]" />
                {rental.totalPrice?.toLocaleString()}
              </span>
            </div>
            <div
              className={cn(
                'flex',
                'justify-between',
                'items-center',
                'text-[10px]',
                'text-muted-dark',
                'font-bold',
                'pt-1.5',
              )}
            >
              <span>
                Payment Mode:{' '}
                <span className={cn('text-muted-foreground/85', 'uppercase')}>
                  {rental.paymentMethod === 'cash'
                    ? 'Cash/COD'
                    : 'Online Payment'}
                </span>
              </span>
              <span>
                Payment Status:{' '}
                <span
                  className={cn(
                    'uppercase',
                    rental.paymentStatus === 'paid'
                      ? 'text-emerald-600'
                      : 'text-warning-foreground',
                  )}
                >
                  {rental.paymentStatus || 'Pending'}
                </span>
              </span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className={cn(
              'w-full',
              'h-11',
              'rounded-2xl',
              'bg-primary',
              'hover:bg-primary-hover',
              'text-primary-foreground',
              'font-extrabold',
              'text-xs',
              'shadow-sm',
              'active:scale-98',
              'transition-all',
              'cursor-pointer',
            )}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
