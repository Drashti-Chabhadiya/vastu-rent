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
          <div className="h-7 bg-gray-200 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 rounded-md w-96" />
        </div>
        <div className="h-[500px] bg-white border border-slate-100 rounded-[2rem] shadow-sm" />
      </div>
    )
  }

  // Extract unique products list for filtration
  const uniqueProducts = Array.from(
    new Set(orders?.map((o: any) => o.product?.title).filter(Boolean) || []),
  )

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
        return 'bg-emerald-500 border-emerald-600 text-white'
      case 'completed':
        return 'bg-blue-500 border-blue-600 text-white'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500 border-red-600 text-white'
      default:
        return 'bg-amber-500 border-amber-600 text-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <CalendarIcon className="text-[#059669]" size={28} />
            Rentals Calendar
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            Track product reserved schedules, monitor date occupancy, and
            prevent double bookings.
          </p>
        </div>

        {/* Date Month Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-extrabold text-slate-800 min-w-[100px] text-center font-display uppercase tracking-wider font-sans">
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
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden font-sans">
        {/* Days of the Week headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                  'border-b border-r border-slate-100 p-2 min-h-[90px] flex flex-col justify-between group transition-colors hover:bg-slate-50/50',
                  !isSelectedMonth && 'bg-slate-50/20 opacity-40',
                  isToday &&
                    'bg-[#faf7f0]/40 border-l-2 border-l-[#059669] lg:border-l-0',
                )}
              >
                {/* Date Number indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center',
                      isToday
                        ? 'bg-[#059669] text-white shadow-sm'
                        : isSelectedMonth
                          ? 'text-slate-800'
                          : 'text-slate-400',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {bookings.length > 0 && (
                    <span className="text-[8px] font-black uppercase text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
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
                    <div className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-tighter">
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
      <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-[#059669] shrink-0 border border-slate-100">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Reserved occupancy validation
          </h4>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-2xl">
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
