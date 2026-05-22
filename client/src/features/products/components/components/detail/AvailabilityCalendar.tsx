import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'

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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-gray-900">Check Availability</h3>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (calMonth === 0) {
              setCalMonth(11)
              setCalYear((y) => y - 1)
            } else setCalMonth((m) => m - 1)
          }}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-bold text-gray-900">
          {monthName} {calYear}
        </p>
        <button
          type="button"
          onClick={() => {
            if (calMonth === 11) {
              setCalMonth(0)
              setCalYear((y) => y + 1)
            } else setCalMonth((m) => m + 1)
          }}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-gray-400 py-1">
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
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            )

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
            <button
              type="button"
              key={day}
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled}
              className={cn(
                'h-7 flex items-center justify-center text-xs rounded-md transition-all relative',
                isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                  : isStart || isEnd
                    ? 'bg-primary text-white font-bold'
                    : inRange
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100 cursor-pointer',
              )}
            >
              {day}
              {isBooked && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          Selected
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary/10" />
          Range
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          Unavailable
        </div>
      </div>
    </div>
  )
}
