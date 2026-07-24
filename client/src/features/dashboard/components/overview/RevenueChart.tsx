import { useState } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { useRevenueOverTime } from '#/hook'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

type Period = 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

export const RevenueChart = () => {
  const { t, formatCurrency } = useTranslation()
  const [period, setPeriod] = useState<Period>('month')
  const [open, setOpen] = useState(false)
  const { data: result, isLoading } = useRevenueOverTime(period)

  const bars = result?.data ?? []
  const totalRevenue = result?.totalRevenue ?? 0
  const maxRevenue =
    bars.length > 0 ? Math.max(...bars.map((b) => b.revenue), 1) : 1

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-dash-text">{t('Revenue Overview')}</h3>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className="h-auto flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-border/120 active:scale-[0.98]"
          >
            {t(PERIOD_LABELS[period])}
            <ChevronDown size={14} className="text-muted-foreground/70" />
          </Button>
          {open && (
            <div className="absolute right-0 mt-1 bg-card border border-border/30 rounded-xl shadow-lg z-10 overflow-hidden flex flex-col w-32">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  onClick={() => {
                    setPeriod(p)
                    setOpen(false)
                  }}
                  className="w-full justify-start rounded-none h-auto px-4 py-2 text-xs font-bold text-dash-text hover:bg-muted-light active:scale-[0.98]"
                >
                  {t(PERIOD_LABELS[p])}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold text-dash-text-muted uppercase">
            {t('Total Revenue')}
          </p>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-36 bg-muted/50 rounded-lg animate-pulse" />
            ) : (
              <>
                <h4 className="text-2xl font-bold text-dash-text">
                  {formatCurrency(totalRevenue)}
                </h4>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp size={14} />
                  <span className="text-xs font-bold text-dash-text-muted">
                    {t(PERIOD_LABELS[period])}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 w-full bg-muted-light rounded-2xl animate-pulse" />
      ) : bars.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground/70 font-medium">
          {t('No revenue data for this period')}
        </div>
      ) : (
        <>
          <div className="relative h-48 w-full flex items-end justify-between gap-1">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-dash-text-muted font-bold">
              <span>₹{Math.round(maxRevenue / 1000)}k</span>
              <span>₹{Math.round((maxRevenue * 0.75) / 1000)}k</span>
              <span>₹{Math.round((maxRevenue * 0.5) / 1000)}k</span>
              <span>₹{Math.round((maxRevenue * 0.25) / 1000)}k</span>
              <span>0</span>
            </div>

            <div className="ml-8 flex-1 h-full flex items-end justify-between gap-1.5">
              {bars.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 bg-dash-brand rounded-t-sm transition-all duration-500 hover:bg-primary-light group relative"
                  style={{
                    height: `${Math.max((bar.revenue / maxRevenue) * 100, 2)}%`,
                  }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ₹{bar.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ml-8 mt-2 flex justify-between text-[10px] text-dash-text-muted font-bold overflow-hidden">
            {bars.length <= 8
              ? bars.map((b) => <span key={b.date}>{b.date}</span>)
              : [
                  bars[0],
                  bars[Math.floor(bars.length / 4)],
                  bars[Math.floor(bars.length / 2)],
                  bars[Math.floor((bars.length * 3) / 4)],
                  bars[bars.length - 1],
                ].map((b) => <span key={b.date}>{b.date}</span>)}
          </div>
        </>
      )}
    </div>
  )
}
