import { useState } from 'react'
import { useOrders, useUpdateRentalStatus } from '#/hook'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { CalendarFilters } from './components/CalendarFilters'
import { DetailedBookingDialog } from './components/DetailedBookingDialog'

export const RentalsCalendar = () => {
  const { data: orders, isLoading } = useOrders()
  const updateStatus = useUpdateRentalStatus()

  // Calendar Navigation States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Selected Order details overlay state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Quick Action handler
  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Booking request successfully ${newStatus}!`)
          // Refresh details card if open
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({ ...selectedOrder, status: newStatus })
          }
        },
        onError: () => {
          toast.error('Failed to update booking status')
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2.5">
          <div className="h-7 bg-muted rounded-lg w-48" />
          <div className="h-4 bg-muted/50 rounded-md w-96" />
        </div>
        <div className="h-[500px] bg-card border border-border/30 rounded-[2rem] shadow-sm" />
      </div>
    )
  }

  // Extract unique products list for filtration
  const uniqueProducts = Array.from(
    new Set(orders?.map((o: any) => o.product?.title).filter(Boolean) || []),
  ) as string[]

  // Filter orders based on owner filters
  const filteredOrders = (orders || []).filter((order: any) => {
    const matchProduct =
      selectedProduct === 'all' || order.product?.title === selectedProduct
    const matchStatus =
      selectedStatus === 'all' || order.status === selectedStatus
    return matchProduct && matchStatus
  })

  // Calculate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  // Determine if a specific date overlaps with a booking
  const getBookingsForDay = (day: Date) => {
    return filteredOrders.filter((order: any) => {
      try {
        const start = parseISO(order.startDate)
        const end = parseISO(order.endDate)

        const dayMidnight = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
        )
        const startMidnight = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        )
        const endMidnight = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        )

        return dayMidnight >= startMidnight && dayMidnight <= endMidnight
      } catch (e) {
        return false
      }
    })
  }

  // Get status color palette for markers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'bg-emerald-500 border-emerald-600 text-primary-foreground'
      case 'completed':
        return 'bg-info-foreground border-info-foreground text-primary-foreground'
      case 'rejected':
      case 'cancelled':
        return 'bg-destructive border-destructive/80 text-destructive-foreground'
      default:
        return 'bg-warning-foreground border-amber-600 text-primary-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} />
            Rentals Calendar
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            Track product reserved schedules, monitor date occupancy, and
            prevent double bookings.
          </p>
        </div>

        {/* Date Month Selector */}
        <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border/30 shadow-sm self-start md:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-extrabold text-foreground/90 min-w-[100px] text-center font-display uppercase tracking-wider font-sans">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* FILTERS CONTAINER */}
      <CalendarFilters
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        uniqueProducts={uniqueProducts}
      />

      {/* CALENDAR VIEW GRID */}
      <div className="bg-card border border-border/30 rounded-[2rem] shadow-sm overflow-hidden font-sans">
        {/* Days of the Week headers */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-muted-light/50 text-center py-4 text-[10px] font-black text-muted-dark uppercase tracking-widest">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 grid-rows-5 min-h-[500px]">
          {calendarDays.map((day, idx) => {
            const isSelectedMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            const bookings = getBookingsForDay(day)

            return (
              <div
                key={idx}
                className={cn(
                  'border-b border-r border-border/30 p-2 min-h-[90px] flex flex-col justify-between group transition-colors hover:bg-muted-light/50',
                  !isSelectedMonth && 'bg-muted-light/20 opacity-40',
                  isToday &&
                    'bg-background/40 border-l-2 border-l-primary lg:border-l-0',
                )}
              >
                {/* Date Number indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center',
                      isToday
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isSelectedMonth
                          ? 'text-foreground/90'
                          : 'text-muted-dark',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {bookings.length > 0 && (
                    <span className="text-[8px] font-black uppercase text-muted-dark shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                      {bookings.length}{' '}
                      {bookings.length === 1 ? 'Book' : 'Books'}
                    </span>
                  )}
                </div>

                {/* Day events marker pills */}
                <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-end">
                  {bookings.slice(0, 3).map((booking: any) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedOrder(booking)}
                      className={cn(
                        'text-[9px] font-black px-2 py-1 rounded-lg border cursor-pointer truncate shadow-sm transition-all active:scale-95',
                        getStatusColor(booking.status),
                      )}
                      title={`${booking.product?.title} - ${booking.renter?.name}`}
                    >
                      {booking.product?.title}
                    </div>
                  ))}
                  {bookings.length > 3 && (
                    <div className="text-[8px] font-bold text-muted-dark text-center uppercase tracking-tighter">
                      + {bookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DOUBLE-BOOKING date occupancy protection alert banner */}
      <div className="bg-muted-light p-5 rounded-[2rem] border border-border/30 flex items-start gap-4">
        <div className="p-3 bg-card rounded-2xl shadow-sm text-primary shrink-0 border border-border/30">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-foreground/90 uppercase tracking-wider">
            Reserved occupancy validation
          </h4>
          <p className="text-xs font-semibold text-muted-foreground/85 leading-relaxed max-w-2xl">
            Confirming a Cash or razorpay booking automatically blocks the
            specific listing dates from being reserved by other renters.
            Rejected/Cancelled requests immediately free the dates.
          </p>
        </div>
      </div>

      {/* DETAILED BOOKING DIALOG CARD OVERLAY */}
      <DetailedBookingDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
        isPendingStatusUpdate={updateStatus.isPending}
      />
    </div>
  )
}
