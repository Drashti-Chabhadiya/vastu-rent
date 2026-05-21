import { useState } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { useRevenueOverTime } from '#/hook'

type Period = 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

export const RevenueChart = () => {
  const [period, setPeriod] = useState<Period>('month')
  const [open, setOpen] = useState(false)
  const { data: result, isLoading } = useRevenueOverTime(period)

  const bars = result?.data ?? []
  const totalRevenue = result?.totalRevenue ?? 0
  const maxRevenue = bars.length > 0 ? Math.max(...bars.map((b) => b.revenue), 1) : 1

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-dash-text">Revenue Overview</h3>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-gray-300"
          >
            {PERIOD_LABELS[period]}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setOpen(false) }}
                  className="block w-full text-left px-4 py-2 text-xs font-bold text-dash-text hover:bg-gray-50"
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold text-dash-text-muted uppercase">Total Revenue</p>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-36 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <>
                <h4 className="text-2xl font-bold text-dash-text">
                  ₹ {totalRevenue.toLocaleString('en-IN')}
                </h4>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp size={14} />
                  <span className="text-xs font-bold text-dash-text-muted">
                    {PERIOD_LABELS[period]}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 w-full bg-gray-50 rounded-2xl animate-pulse" />
      ) : bars.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400 font-medium">
          No revenue data for this period
        </div>
      ) : (
        <>
          <div className="relative h-48 w-full flex items-end justify-between gap-1">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-dash-text-muted font-bold">
              <span>₹{Math.round(maxRevenue / 1000)}k</span>
              <span>₹{Math.round(maxRevenue * 0.75 / 1000)}k</span>
              <span>₹{Math.round(maxRevenue * 0.5 / 1000)}k</span>
              <span>₹{Math.round(maxRevenue * 0.25 / 1000)}k</span>
              <span>0</span>
            </div>

            <div className="ml-8 flex-1 h-full flex items-end justify-between gap-1.5">
              {bars.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 bg-dash-brand rounded-t-sm transition-all duration-500 hover:bg-primary-light group relative"
                  style={{ height: `${Math.max((bar.revenue / maxRevenue) * 100, 2)}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ₹{bar.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ml-8 mt-2 flex justify-between text-[10px] text-dash-text-muted font-bold overflow-hidden">
            {bars.length <= 8
              ? bars.map((b) => <span key={b.date}>{b.date}</span>)
              : [bars[0], bars[Math.floor(bars.length / 4)], bars[Math.floor(bars.length / 2)], bars[Math.floor(bars.length * 3 / 4)], bars[bars.length - 1]].map((b) => (
                  <span key={b.date}>{b.date}</span>
                ))}
          </div>
        </>
      )}
    </div>
  )
}
