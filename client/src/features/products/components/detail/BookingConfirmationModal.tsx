import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '#/lib/utils'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  productImage?: string
  startDate: Date | null
  endDate: Date | null
  totalPrice: number
  basePrice?: number
  securityDeposit?: number
  discountAmount?: number
  paymentMethod?: string
}

export const BookingConfirmationModal = ({
  isOpen,
  onClose,
  productTitle,
  productImage,
  startDate,
  endDate,
  totalPrice,
  basePrice,
  securityDeposit,
  discountAmount,
  paymentMethod = 'online',
}: BookingConfirmationModalProps) => {
  const isCash = paymentMethod === 'cash'
  const bookingId = `VR-${Math.floor(10000 + Math.random() * 90000)}`

  const formattedDates =
    startDate && endDate
      ? `${startDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        })} - ${endDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}`
      : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop on Desktop, Full screen on Mobile */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs hidden sm:block"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'w-full h-full sm:h-auto sm:max-w-md bg-background sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 z-10 shadow-2xl border border-border/10',
              'fixed inset-0 sm:relative sm:inset-auto',
            )}
          >
            {/* Header Content */}
            <div className="flex-1 flex flex-col justify-center sm:justify-start pt-8 sm:pt-2 pb-6">
              {/* Checkmark Double Circle Frame */}
              <div className="relative w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-primary">
                <div className="w-14 h-14 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-xs">
                  <CheckCircle2
                    className="w-7 h-7 text-primary"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Title & Subtext */}
              <h2 className="font-display text-2xl font-black text-center text-foreground leading-tight">
                Booking confirmed!
              </h2>
              <p className="text-center text-xs text-muted-foreground mt-2.5 font-medium max-w-[290px] mx-auto leading-relaxed">
                {isCash
                  ? 'Your reservation request is set. The host will confirm pickup details shortly.'
                  : 'Your reservation is set. The host has been notified and will prep the item for pickup.'}
              </p>

              {/* Summary Card */}
              <div className="bg-white dark:bg-card border border-border/15 rounded-[22px] p-5 mt-6 shadow-xs">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-muted-light overflow-hidden shrink-0 border border-border/10">
                    <img
                      src={productImage || '/assets/avatar-placeholder.png'}
                      alt={productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-foreground truncate">
                      {productTitle}
                    </h4>
                    {formattedDates && (
                      <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                        {formattedDates}
                      </p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border/20 my-4" />

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-black text-muted-foreground uppercase tracking-widest">
                      Booking ID
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      #{bookingId}
                    </span>
                  </div>
                  {basePrice !== undefined && basePrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-black text-muted-foreground uppercase tracking-widest">
                        Rental Cost
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        ₹{basePrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {securityDeposit !== undefined && securityDeposit > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-black text-muted-foreground uppercase tracking-widest">
                        Security Deposit
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        ₹{securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {discountAmount !== undefined && discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-[9.5px] font-black uppercase tracking-widest">
                        Discount
                      </span>
                      <span className="text-xs font-bold">
                        -₹{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-border/20 my-1.5" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-[9.5px] font-black text-muted-foreground uppercase tracking-widest">
                      Amount paid
                    </span>
                    <span className="text-sm font-black text-foreground">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="flex flex-col gap-3 pb-4">
              <Link to="/account/bookings" className="w-full" onClick={onClose}>
                <Button className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black shadow-md border-none flex items-center justify-center cursor-pointer transition-all active:scale-[0.98]">
                  View booking
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-11 rounded-full border-border/80 bg-transparent text-foreground text-xs font-black hover:bg-muted-light/20 cursor-pointer shadow-none"
                onClick={onClose}
              >
                Back to home
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
