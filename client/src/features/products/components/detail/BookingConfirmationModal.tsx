import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Banknote,
  ArrowRight,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  startDate: Date | null
  endDate: Date | null
  totalPrice: number
  paymentMethod?: string
}

export const BookingConfirmationModal = ({
  isOpen,
  onClose,
  productTitle,
  startDate,
  endDate,
  totalPrice,
  paymentMethod = 'online',
}: BookingConfirmationModalProps) => {
  const isCash = paymentMethod === 'cash'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Green header strip */}
            <div className="bg-primary px-8 pt-10 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.15,
                  duration: 0.4,
                  type: 'spring',
                  bounce: 0.5,
                }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2
                  className="w-9 h-9 text-white"
                  strokeWidth={2.5}
                />
              </motion.div>
              <h3 className="text-xl font-black text-white leading-tight">
                Booking Confirmed!
              </h3>
              <p className="text-white/75 text-sm mt-1 font-medium">
                {isCash
                  ? 'Your request has been sent to the lister.'
                  : 'Payment received & booking confirmed.'}
              </p>
            </div>

            {/* Details */}
            <div className="px-7 py-6 space-y-4">
              {/* Product name */}
              <div className="text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Item Rented
                </p>
                <p className="text-base font-black text-foreground mt-1 leading-snug">
                  {productTitle}
                </p>
              </div>

              <div className="h-px bg-border/40" />

              {/* Dates */}
              {startDate && endDate && (
                <div className="flex items-center gap-3 bg-muted-light rounded-2xl px-4 py-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-xs font-bold text-foreground">
                    {startDate.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    {' → '}
                    {endDate.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              )}

              {/* Payment method & amount */}
              <div className="flex items-center gap-3 bg-muted-light rounded-2xl px-4 py-3">
                {isCash ? (
                  <Banknote className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground">
                    {isCash ? 'Cash on Pickup' : 'Online Payment'}
                  </p>
                  <p className="text-sm font-black text-foreground">
                    ₹{totalPrice.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isCash ? 'bg-warning/20 text-warning-foreground' : 'bg-primary-soft text-primary'}`}
                >
                  {isCash ? 'Pay at pickup' : 'Paid'}
                </span>
              </div>

              {isCash && (
                <p className="text-[11px] text-muted-foreground text-center leading-relaxed font-medium">
                  The lister will confirm your request. You'll be notified once
                  approved.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-7 pb-7 flex flex-col gap-2.5">
              <Link to="/account/bookings" className="w-full" onClick={onClose}>
                <Button className="w-full h-11 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm flex items-center gap-2">
                  View My Bookings
                  <ArrowRight size={15} />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-border font-bold text-sm"
                onClick={onClose}
              >
                Continue Browsing
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
