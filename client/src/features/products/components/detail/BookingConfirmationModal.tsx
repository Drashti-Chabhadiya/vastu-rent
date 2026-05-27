import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  startDate: Date | null
  endDate: Date | null
  totalPrice: number
}

export const BookingConfirmationModal = ({
  isOpen,
  onClose,
  productTitle,
  startDate,
  endDate,
  totalPrice,
}: BookingConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">
            Booking Confirmed!
          </h3>
          <p className="text-sm text-muted-foreground/85 mt-2">
            {productTitle} booked from {startDate?.toLocaleDateString('en-IN')}{' '}
            to {endDate?.toLocaleDateString('en-IN')}.
          </p>
          <p className="text-lg font-black text-primary mt-3">
            ₹{totalPrice.toLocaleString()} total
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl font-bold"
            onClick={onClose}
          >
            Close
          </Button>
          <Link to="/account/bookings" className="flex-1">
            <Button className="w-full rounded-xl bg-primary text-primary-foreground font-bold">
              My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
