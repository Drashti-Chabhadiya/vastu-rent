import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useProductBookingStore } from '../../../../store/useProductBookingStore'
import { useTranslation } from '#/context/TranslationContext'

interface AvailabilityCalendarProps {
  today: Date
  productRentals: any[]
  handleDayClick: (day: number) => void
  variant?: 'default' | 'sheet'
}

export const AvailabilityCalendar = ({
  today,
  productRentals,
  handleDayClick,
  variant = 'default',
}: AvailabilityCalendarProps) => {
  const { t, formatDate, formatDigits } = useTranslation()
  const { calMonth, calYear, setCalMonth, setCalYear, startDate, endDate } =
    useProductBookingStore()

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const monthName = formatDate(new Date(calYear, calMonth, 1), {
    month: 'long',
  })

  const isSheet = variant === 'sheet'

  return (
    <div
      className={cn(
        isSheet
          ? 'bg-transparent p-0 border-none shadow-none space-y-4'
          : 'bg-card rounded-2xl p-4 lg:p-4 xl:p-6 border border-border/30 shadow-sm space-y-4',
      )}
    >
      {!isSheet && (
        <h3 className="text-base font-bold text-foreground">
          {t('Check Availability')}
        </h3>
      )}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (calMonth === 0) {
              setCalMonth(11)
              setCalYear((y) => y - 1)
            } else setCalMonth((m) => m - 1)
          }}
          className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center shrink-0 border-none cursor-pointer"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="text-sm font-extrabold text-foreground capitalize">
          {monthName} {formatDigits(calYear)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (calMonth === 11) {
              setCalMonth(0)
              setCalYear((y) => y + 1)
            } else setCalMonth((m) => m + 1)
          }}
          className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center shrink-0 border-none cursor-pointer"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-0.5 text-center">
        {(isSheet
          ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        ).map((d, i) => (
          <div
            key={i}
            className="text-[10px] font-extrabold text-muted-foreground/75 py-1"
          >
            {t(d)}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(calYear, calMonth, day)
          const isPast =
            date <
            new Date(today.getFullYear(), today.getMonth(), today.getDate())

          // Check if this date is within any existing rental range
          const isBooked = productRentals.some((r: any) => {
            const start = new Date(r.startDate)
            const end = new Date(r.endDate)
            // Set time to midnight for accurate comparison
            const d = new Date(date)
            d.setHours(0, 0, 0, 0)
            const s = new Date(start)
            s.setHours(0, 0, 0, 0)
            const e = new Date(end)
            e.setHours(0, 0, 0, 0)
            return d >= s && d <= e
          })

          const isStart =
            startDate && date.toDateString() === startDate.toDateString()
          const isEnd =
            endDate && date.toDateString() === endDate.toDateString()
          const inRange =
            startDate && endDate && date > startDate && date < endDate

          const isDisabled = isPast || isBooked

          return (
            <Button
              type="button"
              key={day}
              variant="ghost"
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled}
              className={cn(
                'h-8 w-full flex items-center justify-center text-xs rounded-full transition-all relative font-extrabold active:scale-[0.98]',
                isDisabled
                  ? 'text-muted-dark/50 cursor-not-allowed bg-transparent'
                  : isStart || isEnd
                    ? 'bg-primary text-white hover:bg-primary hover:text-white'
                    : inRange
                      ? 'bg-muted text-primary rounded-none first-of-type:rounded-l-full last-of-type:rounded-r-full'
                      : 'text-foreground hover:bg-muted/50 cursor-pointer',
              )}
            >
              {formatDigits(day)}
              {isBooked && !isStart && !isEnd && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-destructive/40" />
              )}
            </Button>
          )
        })}
      </div>
      {!isSheet && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/85 pt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            {t('Selected')}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-none bg-muted" />
            {t('Range')}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted-light/50" />
            {t('Unavailable')}
          </div>
        </div>
      )}
    </div>
  )
}
