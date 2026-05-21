import { useState } from 'react'
import { useOrders, useUpdateRentalStatus } from '#/hook'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  User as UserIcon,
  Clock,
  CheckCircle2,
  XCircle,
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
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { toast } from 'sonner'

export const RentalsCalendar = () => {
  const { data: orders, isLoading } = useOrders()
  const updateStatus = useUpdateRentalStatus()

  // Calendar Navigation States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Selected Order details overlay state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [pendingAction, setPendingAction] = useState<
    'confirm' | 'reject' | null
  >(null)

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

  // Duration Calculator helper
  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
    return diff || 1
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <CheckCircle2 size={10} /> Confirmed
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <CheckCircle2 size={10} /> Completed
          </Badge>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <Badge className="bg-red-50 text-red-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <XCircle size={10} /> Cancelled
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-50 text-amber-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Clock size={10} /> Pending
          </Badge>
        )
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
          <span className="text-sm font-extrabold text-slate-800 min-w-[100px] text-center font-display uppercase tracking-wider">
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
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <Filter size={14} /> Filter Bookings:
        </div>

        {/* Product dropdown Filter */}
        <div className="space-y-1">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="h-10 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer"
          >
            <option value="all">All Products</option>
            {uniqueProducts.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        {/* Status dropdown Filter */}
        <div className="space-y-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Confirmed / Active</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected / Cancelled</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedProduct !== 'all' || selectedStatus !== 'all') && (
          <Button
            onClick={() => {
              setSelectedProduct('all')
              setSelectedStatus('all')
            }}
            variant="ghost"
            className="h-10 px-4 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50"
          >
            Reset Filters
          </Button>
        )}
      </div>

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
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        {selectedOrder && (
          <DialogContent className="max-w-xl p-0 border-none bg-slate-50 rounded-[2.5rem] shadow-2xl font-sans overflow-hidden">
            {/* Top Product Banner card */}
            <div className="relative h-44 bg-slate-900">
              {selectedOrder.product?.images?.[0] && (
                <img
                  src={selectedOrder.product.images[0]}
                  alt=""
                  className="w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50/95 px-2 py-0.5 rounded">
                  {selectedOrder.product?.category?.name || 'Item'}
                </span>
                <h3 className="text-xl font-extrabold text-white leading-tight font-display mt-2">
                  {selectedOrder.product?.title}
                </h3>
              </div>
            </div>

            {/* Core Details body */}
            <div className="p-8 space-y-6">
              {/* Top details columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                    Customer Info
                  </span>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserIcon size={12} className="text-slate-400" />
                    <span>{selectedOrder.renter?.name}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">
                    {selectedOrder.renter?.email}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                    Status & Method
                  </span>
                  <div className="flex gap-1.5 items-center">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight pt-1">
                    Via{' '}
                    {selectedOrder.paymentMethod === 'cash'
                      ? 'Cash / CoD'
                      : 'Online'}
                  </span>
                </div>
              </div>

              {/* Booking dates and rental duration info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                  Reserved Duration
                </span>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase">
                      From
                    </span>
                    <span>
                      {format(new Date(selectedOrder.startDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 mt-2" />
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-slate-400 uppercase">
                      To
                    </span>
                    <span>
                      {format(new Date(selectedOrder.endDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Total Rental Period</span>
                  <span className="text-[#059669] font-black">
                    {calculateDuration(
                      selectedOrder.startDate,
                      selectedOrder.endDate,
                    )}{' '}
                    Days
                  </span>
                </div>
              </div>

              {/* Earnings info and pricing breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Daily rate</span>
                  <span className="text-slate-800 font-bold">
                    ₹
                    {(
                      selectedOrder.product?.price || selectedOrder.totalPrice
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security deposit</span>
                  <span className="text-slate-800 font-bold">
                    ₹{(selectedOrder.depositAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-black text-[#059669] border-t border-slate-100 pt-2">
                  <span>Total Earnings</span>
                  <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Action buttons (Confirm / Reject requests if pending) */}
              {selectedOrder.status === 'pending' ? (
                <div className="flex gap-4 pt-2">
                  <Button
                    onClick={() => setPendingAction('confirm')}
                    className="flex-1 h-12 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <CheckCircle2 size={14} /> Confirm Booking
                  </Button>
                  <Button
                    onClick={() => setPendingAction('reject')}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl bg-white hover:bg-red-50 text-[#ef4444] border border-[#ef4444]/30 font-black text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <XCircle size={14} /> Reject Request
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-100/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Request already processed
                  </span>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* RADIX CONFIRMATION PROMPTS */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="max-w-md p-8 border-none bg-white rounded-[2rem] shadow-2xl font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black text-slate-800 flex items-center gap-3">
              {pendingAction === 'confirm' ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669]">
                    <CheckCircle2 size={20} />
                  </div>
                  <span>Confirm Booking?</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444]">
                    <XCircle size={20} />
                  </div>
                  <span>Reject Booking Request?</span>
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] font-semibold text-slate-500 leading-relaxed pt-2">
              {pendingAction === 'confirm'
                ? `Are you sure you want to accept this rental booking request for "${selectedOrder?.product?.title || 'this item'}"? The dates will be reserved in your calendar, and the renter will receive a notification.`
                : `Are you sure you want to reject this rental booking request for "${selectedOrder?.product?.title || 'this item'}"? The dates will remain available, and the renter will be notified.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 mt-8">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border border-slate-100 font-black text-[11px] text-slate-500 hover:bg-slate-50 active:scale-95 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedOrder) {
                  if (pendingAction === 'confirm') {
                    handleStatusUpdate(selectedOrder.id, 'confirmed')
                  } else if (pendingAction === 'reject') {
                    handleStatusUpdate(selectedOrder.id, 'rejected')
                  }
                }
                setPendingAction(null)
                setSelectedOrder(null)
              }}
              className={cn(
                'h-12 flex-1 rounded-xl font-black text-[11px] text-white active:scale-95 transition-all',
                pendingAction === 'confirm'
                  ? 'bg-[#059669] hover:bg-[#059669]/90 shadow-lg shadow-emerald-100'
                  : 'bg-[#ef4444] hover:bg-[#ef4444]/90 shadow-lg shadow-red-100',
              )}
            >
              {pendingAction === 'confirm'
                ? 'Confirm Booking'
                : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
