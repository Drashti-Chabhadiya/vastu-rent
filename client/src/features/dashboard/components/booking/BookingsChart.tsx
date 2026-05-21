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

const bookingsData = [
  { date: 'May 12', bookings: 600 },
  { date: 'May 13', bookings: 650 },
  { date: 'May 14', bookings: 1200 },
  { date: 'May 15', bookings: 900 },
  { date: 'May 16', bookings: 1100 },
  { date: 'May 17', bookings: 1500 },
  { date: 'May 18', bookings: 2000 },
]

export const BookingsChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-dash-text">
          Bookings Overview
        </h3>

        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-gray-300">
          This Week
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bookingsData}>
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
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="bookings"
              stroke="var(--color-brand-light)"
              fill="url(#bookingGradient)"
              strokeWidth={3}
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: '#fff',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}