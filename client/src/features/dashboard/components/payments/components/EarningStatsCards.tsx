import { TrendingUp, Calendar, Coins, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface EarningStatsCardsProps {
  stats: {
    totalEarnings: number
    monthlyEarnings: number
    totalBookings: number
    netEarnings: number
    withdrawableBalance: number
    pendingPayouts: number
    completedPayouts: number
  }
}

export const EarningStatsCards = ({ stats }: EarningStatsCardsProps) => {
  const { t, formatNumber, formatCurrency } = useTranslation()
  const cards = [
    {
      title: t('Total Revenue'),
      value: stats.totalEarnings,
      description: t('All successful orders'),
      icon: TrendingUp,
      bgClass: 'bg-emerald-50 text-emerald-600',
      isCount: false,
    },
    {
      title: t('Monthly Revenue'),
      value: stats.monthlyEarnings,
      description: t('This current month'),
      icon: Calendar,
      bgClass: 'bg-info text-info-foreground',
      descClass: 'text-info-foreground font-medium',
      isCount: false,
    },
    {
      title: t('Total Bookings'),
      value: stats.totalBookings,
      description: t('Bookings received'),
      icon: Coins,
      bgClass: 'bg-warning text-warning-foreground',
      descClass: 'text-warning-foreground',
      isCount: true,
    },
    {
      title: t('Withdrawn Paid'),
      value: stats.completedPayouts,
      description: t('Successfully settled'),
      icon: CheckCircle2,
      bgClass: 'bg-indigo-50 text-indigo-600',
      descClass: 'text-indigo-500',
      isCount: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={i}
            className="bg-card p-6 rounded-3xl border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bgClass}`}
            >
              <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
                {card.title}
              </span>
              <h3 className="text-xl font-black text-foreground/90">
                {card.isCount ? formatNumber(card.value) : formatCurrency(card.value)}
              </h3>
              <span
                className={`text-[9px] font-bold text-muted-dark block ${card.descClass || ''}`}
              >
                {card.description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
