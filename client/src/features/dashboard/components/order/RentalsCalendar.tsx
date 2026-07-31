import { useState, useRef, useEffect } from 'react'
import { useOrders, useUpdateRentalStatus } from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslation } from '#/context/TranslationContext'
import {
  Calendar as CalendarIcon,
  CalendarX,
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
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export const RentalsCalendar = () => {
  const { t, formatNumber, formatDate } = useTranslation()
  const { data: orders, isLoading } = useOrders()
  const { data: session } = authClient.useSession()
  const currentUser = session?.user
  const isAdmin = currentUser?.role === 'admin'
  const [currentView, setCurrentView] = useState<'my' | 'all'>('my')

  const updateStatus = useUpdateRentalStatus()

  // Calendar Navigation States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [activeDate, setActiveDate] = useState<Date>(new Date())
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll active date into view on mount and when month changes
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) {
        scrollContainerRef.current.scrollTo({
          left: activeEl.offsetLeft - scrollContainerRef.current.offsetLeft - 16,
          behavior: 'smooth'
        })
      }
    }
  }, [currentMonth]) // deliberately only scroll on mount/month change, not every tap

  // Selected Order details overlay state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Quick Action handler
  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            t('Booking request successfully {newStatus}!').replace(
              '{newStatus}',
              newStatus,
            ),
          )
          // Refresh details card if open
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({ ...selectedOrder, status: newStatus })
          }
        },
        onError: () => {
          toast.error(t('Failed to update booking status'))
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
  const uniqueProducts: string[] = Array.from(
    new Set(
      (orders ?? [])
        .filter((o: any) => {
          if (isAdmin && currentView === 'my') {
            return o.product?.userId === currentUser?.id
          }
          return true
        })
        .map((o: any) => o.product?.title)
        .filter((title: any): title is string => Boolean(title)),
    ),
  )

  // Filter orders based on provider filters
  const filteredOrders = (orders || []).filter((order: any) => {
    if (isAdmin && currentView === 'my') {
      if (order.product?.userId !== currentUser?.id) return false
    }
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
        return 'bg-warning-foreground border-warning-foreground text-primary-foreground'
    }
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} />
            {t('Rentals & Bookings Calendar')}
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            {t(
              'Visual overview of rental duration and availability schedules.',
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
          {isAdmin ? (
            <div className="flex items-center gap-2 rounded-full bg-dash-bg-soft p-1 shrink-0">
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentView('my')
                  setSelectedProduct('all')
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto cursor-pointer ${currentView === 'my'
                  ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                  : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
                  }`}
              >
                {t('My Rentals')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentView('all')
                  setSelectedProduct('all')
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto cursor-pointer ${currentView === 'all'
                  ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                  : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
                  }`}
              >
                {t('All Platform Rentals')}
              </Button>
            </div>
          ) : null}

          {/* Date Month Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border/30 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-extrabold text-foreground/90 min-w-[100px] text-center font-display uppercase tracking-wider font-sans">
              {formatDate(currentMonth, { month: 'long', year: 'numeric' })}
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
      </motion.div>

      {/* FILTERS CONTAINER (Desktop) */}
      <motion.div variants={fadeUp} className="hidden md:block">
        <CalendarFilters
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          uniqueProducts={uniqueProducts}
        />
      </motion.div>

      {/* DESKTOP CALENDAR VIEW GRID */}
      <motion.div
        variants={fadeUp}
        className="hidden md:block bg-card border border-border/30 rounded-[2rem] shadow-sm overflow-hidden font-sans"
      >
        {/* Days of the Week headers */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-muted-light/50 text-center py-4 text-[10px] font-black text-muted-dark uppercase tracking-widest">
          <div>{t('Sun')}</div>
          <div>{t('Mon')}</div>
          <div>{t('Tue')}</div>
          <div>{t('Wed')}</div>
          <div>{t('Thu')}</div>
          <div>{t('Fri')}</div>
          <div>{t('Sat')}</div>
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
                    {formatNumber(parseInt(format(day, 'd')))}
                  </span>

                  {bookings.length > 0 && (
                    <span className="text-[8px] font-black uppercase text-muted-dark shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                      {formatNumber(bookings.length)}{' '}
                      {bookings.length === 1 ? t('Book') : t('Books')}
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
                      + {formatNumber(bookings.length - 3)} {t('more')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* MOBILE AGENDA VIEW (Hidden on md/lg) */}
      <motion.div variants={fadeUp} className="md:hidden space-y-4">
        {/* Mobile Month Selector */}
        <div className="flex items-center justify-between px-2 mb-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-transparent">
            <ChevronLeft size={18} className="text-dash-text" strokeWidth={2.5} />
          </Button>
          <span className="text-[17px] font-black text-dash-text font-display tracking-wide">
            {formatDate(currentMonth, { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-transparent">
            <ChevronRight size={18} className="text-dash-text" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Horizontal scroll dates */}
        <div ref={scrollContainerRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 px-1 -mx-2">
          {calendarDays.map((day, idx) => {
            const isSelected = isSameDay(day, activeDate)
            return (
              <button
                key={idx}
                data-active={isSelected}
                onClick={() => setActiveDate(day)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-[18px] transition-all shrink-0",
                  isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-brand-beige text-dash-text hover:bg-brand-beige/80 dark:bg-muted/50 dark:hover:bg-muted"
                )}
              >
                <span className={cn("text-[9px] font-black uppercase mb-0.5 tracking-widest", isSelected ? "text-primary-foreground/90" : "text-dash-text/80")}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-[20px] font-black leading-none">
                  {formatNumber(parseInt(format(day, 'd')))}
                </span>
                {getBookingsForDay(day).length > 0 && (
                  <div className={cn("w-1 h-1 rounded-full mt-1.5", isSelected ? "bg-primary-foreground" : "bg-primary")} />
                )}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <CalendarFilters
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          uniqueProducts={uniqueProducts}
        />

        {/* Selected Date Bookings */}
        <div className="bg-card border border-border/40 border-dashed rounded-[2rem] p-6 min-h-[250px] flex flex-col justify-center">
          {(() => {
            const activeBookings = getBookingsForDay(activeDate);
            if (activeBookings.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-card border border-border/15 rounded-3xl mt-4 shadow-3xs max-w-sm mx-auto">
                  <div className="w-14 h-14 bg-brand-beige/50 rounded-full flex items-center justify-center mb-4">
                    <CalendarX className="w-6 h-6 text-foreground/50" />
                  </div>
                  <h4 className="text-[15px] font-black text-dash-text mb-1">
                    {t('Nothing scheduled for {date}').replace('{date}', format(activeDate, 'd MMM'))}
                  </h4>
                  <p className="text-xs text-dash-text-muted">
                    {t('Tap a date above to check its rentals.')}
                  </p>
                </div>
              )
            }
            return (
              <div className="space-y-3 w-full h-full flex flex-col justify-start">
                <h4 className="text-xs font-black uppercase tracking-widest text-dash-text-muted mb-2">
                  {t('Rentals on {date}').replace('{date}', format(activeDate, 'MMM d, yyyy'))}
                </h4>
                {activeBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedOrder(booking)}
                    className="p-3 bg-muted-light/30 rounded-xl border border-border/30 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={booking.product?.images?.[0] || 'https://placehold.co/100x100/png'} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-dash-text truncate">{booking.product?.title}</p>
                        <p className="text-[10px] text-dash-text-muted truncate">{booking.renter?.name}</p>
                      </div>
                    </div>
                    <div className={cn("text-[9px] font-black px-2 py-1 rounded-lg border uppercase shrink-0 ml-2", getStatusColor(booking.status))}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </motion.div>

      {/* DOUBLE-BOOKING date occupancy protection alert banner */}
      <motion.div
        variants={fadeUp}
        className="bg-muted-light p-5 rounded-[2rem] border border-border/30 flex items-start gap-4"
      >
        <div className="p-3 bg-card rounded-2xl shadow-sm text-primary shrink-0 border border-border/30">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-foreground/90 uppercase tracking-wider">
            {t('Reserved occupancy validation')}
          </h4>
          <p className="text-xs font-semibold text-muted-foreground/85 leading-relaxed max-w-2xl">
            {t(
              'Confirming a booking (Cash or Online) automatically blocks the specific listing dates from being reserved by other renters. Rejected/Cancelled requests immediately free the dates.',
            )}
          </p>
        </div>
      </motion.div>

      {/* DETAILED BOOKING DIALOG CARD OVERLAY */}
      <DetailedBookingDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
        isPendingStatusUpdate={updateStatus.isPending}
      />
    </motion.div>
  )
}
