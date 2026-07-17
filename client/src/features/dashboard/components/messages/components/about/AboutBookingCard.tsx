import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { useMyRentals, useOrders } from '#/hook'

interface AboutBookingCardProps {
  otherParticipantId: string
  currentUserId: string
}

export function AboutBookingCard({
  otherParticipantId,
  currentUserId,
}: AboutBookingCardProps) {
  const navigate = useNavigate()

  // Fetch real rentals and orders dynamically
  const { data: myRentals = [] } = useMyRentals()
  const { data: orders = [] } = useOrders()

  // Check if there is an active rental order between the current user and the other participant
  const realRental = [...myRentals, ...orders].find((rental: any) => {
    const isProductOwnerOther = rental.product?.userId === otherParticipantId
    const isProductOwnerMe = rental.product?.userId === currentUserId
    const isRenterOther = rental.renterId === otherParticipantId
    const isRenterMe = rental.renterId === currentUserId

    return (
      (isProductOwnerOther && isRenterMe) || (isProductOwnerMe && isRenterOther)
    )
  })

  if (!realRental) return null

  const sDate = new Date(realRental.startDate)
  const eDate = new Date(realRental.endDate)
  const diffDays = Math.ceil((eDate.getTime() - sDate.getTime()) / 86400000) + 1

  const bookingInfo = {
    title: realRental.product?.title || 'Rental Unit',
    category: realRental.product?.category?.name || 'Vastu Rent',
    dates: `${format(sDate, 'dd MMM')} - ${format(eDate, 'dd MMM yyyy')}`,
    days: `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`,
    image:
      realRental.product?.images?.[0] ||
      'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=200&q=80',
  }

  const handleViewBooking = () => {
    if (realRental.renterId === currentUserId) {
      navigate({ to: '/account/bookings' })
    } else {
      navigate({ to: '/account/orders' })
    }
  }

  return (
    <div className="bg-card border border-border/30 rounded-[2rem] p-5 shadow-2xs flex flex-col gap-3.5 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-foreground">
          Booking summary
        </span>
        <button
          onClick={handleViewBooking}
          className="text-[12px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1 shadow-none"
        >
          <span>View booking</span>
          <span className="text-[10px]">&rarr;</span>
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 bg-brand-cream-light p-3 rounded-2xl border border-border/40">
        <div className="flex-1 min-w-0">
          <span className="text-[12.5px] font-bold text-foreground leading-tight block truncate">
            {bookingInfo.title}
          </span>
          <span className="text-[10.5px] text-muted-dark font-semibold mt-0.5 block truncate">
            {bookingInfo.category}
          </span>
          <span className="text-[11.5px] font-semibold text-muted-foreground mt-2 block">
            {bookingInfo.dates}
          </span>
          <span className="text-[10.5px] text-muted-dark font-semibold block">
            {bookingInfo.days}
          </span>
        </div>
        <img
          src={bookingInfo.image}
          alt={bookingInfo.title}
          className="w-14 h-14 rounded-xl object-cover border border-border/40 shadow-3xs shrink-0 self-center"
        />
      </div>
    </div>
  )
}
