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
import { cn } from "../../../../lib/utils";

type Period = 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

export const BookingsChart = () => {
  const [period, setPeriod] = useState<Period>('week')
  const [open, setOpen] = useState(false)
  const { data = [], isLoading } = useBookingsOverTime(period)

  return (
    <div className={cn('bg-white', 'p-6', 'rounded-2xl', 'border', 'border-gray-100', 'shadow-sm', 'h-full')}>
      {/* Header */}
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-8')}>
        <h3 className={cn('font-bold', 'text-dash-text')}>Bookings Overview</h3>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn('flex', 'items-center', 'gap-2', 'px-3', 'py-1.5', 'border', 'border-gray-200', 'rounded-lg', 'text-xs', 'font-bold', 'text-dash-text', 'cursor-pointer', 'hover:border-gray-300')}
          >
            {PERIOD_LABELS[period]}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {open && (
            <div className={cn('absolute', 'right-0', 'mt-1', 'bg-white', 'border', 'border-gray-100', 'rounded-xl', 'shadow-lg', 'z-10', 'overflow-hidden')}>
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setOpen(false) }}
                  className={cn('block', 'w-full', 'text-left', 'px-4', 'py-2', 'text-xs', 'font-bold', 'text-dash-text', 'hover:bg-gray-50')}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className={cn('h-72', 'w-full')}>
        {isLoading ? (
          <div className={cn('h-full', 'flex', 'items-center', 'justify-center')}>
            <div className={cn('w-full', 'h-48', 'bg-gray-50', 'rounded-2xl', 'animate-pulse')} />
          </div>
        ) : data.length === 0 ? (
          <div className={cn('h-full', 'flex', 'items-center', 'justify-center', 'text-sm', 'text-gray-400', 'font-medium')}>
            No booking data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-light)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-brand-light)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
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
