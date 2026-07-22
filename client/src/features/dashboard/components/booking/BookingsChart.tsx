'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useBookingsOverTime } from '#/hook'
import { cn } from '../../../../lib/utils'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

type Period = 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

export const BookingsChart = () => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('week')
  const [open, setOpen] = useState(false)
  const { data = [], isLoading } = useBookingsOverTime(period)

  return (
    <div
      className={cn(
        'bg-card',
        'p-6',
        'rounded-2xl',
        'border',
        'border-border/30',
        'shadow-sm',
        'h-full',
      )}
    >
      {/* Header */}
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-8')}>
        <h3 className={cn('font-bold', 'text-dash-text')}>
          {t('Bookings Overview')}
        </h3>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 h-auto border border-border rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-border/120 active:scale-[0.98]"
          >
            {t(PERIOD_LABELS[period])}
            <ChevronDown size={14} className="text-muted-foreground/70" />
          </Button>
          {open && (
            <div
              className={cn(
                'absolute',
                'right-0',
                'mt-1',
                'bg-card',
                'border',
                'border-border/30',
                'rounded-xl',
                'shadow-lg',
                'z-10',
                'overflow-hidden',
                'flex',
                'flex-col',
                'w-32',
              )}
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  onClick={() => {
                    setPeriod(p)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full',
                    'justify-start',
                    'rounded-none',
                    'h-auto',
                    'px-4',
                    'py-2',
                    'text-xs',
                    'font-bold',
                    'text-dash-text',
                    'hover:bg-muted-light',
                    'cursor-pointer',
                    'active:scale-[0.98]',
                  )}
                >
                  {t(PERIOD_LABELS[p])}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className={cn('h-72', 'w-full')}>
        {isLoading ? (
          <div
            className={cn('h-full', 'flex', 'items-center', 'justify-center')}
          >
            <div
              className={cn(
                'w-full',
                'h-48',
                'bg-muted-light',
                'rounded-2xl',
                'animate-pulse',
              )}
            />
          </div>
        ) : data.length === 0 ? (
          <div
            className={cn(
              'h-full',
              'flex',
              'items-center',
              'justify-center',
              'text-sm',
              'text-muted-foreground/70',
              'font-medium',
            )}
          >
            {t('No booking data for this period')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="bookingGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-brand-light)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-brand-light)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip formatter={(v: any) => [`${v} bookings`, 'Bookings']} />

              <Area
                type="monotone"
                dataKey="bookings"
                stroke="var(--color-brand-light)"
                fill="url(#bookingGradient)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
