import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

interface AvailabilityCalendarProps {
  calMonth: number
  calYear: number
  setCalMonth: React.Dispatch<React.SetStateAction<number>>
  setCalYear: React.Dispatch<React.SetStateAction<number>>
  daysInMonth: number
  firstDay: number
  monthName: string
  startDate: Date | null
  endDate: Date | null
  today: Date
  productRentals: any[]
  handleDayClick: (day: number) => void
}

export const AvailabilityCalendar = ({
  calMonth,
  calYear,
  setCalMonth,
  setCalYear,
  daysInMonth,
  firstDay,
  monthName,
  startDate,
  endDate,
  today,
  productRentals,
  handleDayClick,
}: AvailabilityCalendarProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/30 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-foreground">Check Availability</h3>
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
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="text-sm font-bold text-foreground">
          {monthName} {calYear}
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
          className="h-8 w-8 rounded-lg"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-muted-foreground/70 py-1">
            {d}
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
                'h-7 w-full flex items-center justify-center text-xs rounded-md transition-all relative font-medium active:scale-[0.98]',
                isDisabled
                  ? 'text-muted-dark cursor-not-allowed bg-muted-light/50 hover:bg-muted-light/50 hover:text-muted-dark'
                  : isStart || isEnd
                    ? 'bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground'
                    : inRange
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                      : 'text-foreground/80 hover:bg-muted/50 cursor-pointer',
              )}
            >
              {day}
              {isBooked && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-destructive/80" />
              )}
            </Button>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/85 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          Selected
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary/10" />
          Range
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/50" />
          Unavailable
        </div>
      </div>
    </div>
  )
}
