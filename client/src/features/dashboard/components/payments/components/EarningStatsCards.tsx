import { TrendingUp, Calendar, Coins, CheckCircle2 } from 'lucide-react'

interface EarningStatsCardsProps {
  stats: {
    totalEarnings: number
    monthlyEarnings: number
    platformCommission: number
    netEarnings: number
    withdrawableBalance: number
    pendingPayouts: number
    completedPayouts: number
  }
}

export const EarningStatsCards = ({ stats }: EarningStatsCardsProps) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats.totalEarnings,
      description: 'All successful orders',
      icon: TrendingUp,
      bgClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Monthly Revenue',
      value: stats.monthlyEarnings,
      description: 'This current month',
      icon: Calendar,
      bgClass: 'bg-blue-50 text-blue-600',
      descClass: 'text-blue-500 font-medium',
    },
    {
      title: 'Commission (10%)',
      value: stats.platformCommission,
      description: 'Platform charge',
      icon: Coins,
      bgClass: 'bg-amber-50 text-amber-600',
      descClass: 'text-amber-500',
    },
    {
      title: 'Withdrawn Paid',
      value: stats.completedPayouts,
      description: 'Successfully settled',
      icon: CheckCircle2,
      bgClass: 'bg-indigo-50 text-indigo-600',
      descClass: 'text-indigo-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bgClass}`}>
              <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                {card.title}
              </span>
              <h3 className="text-xl font-black text-slate-800">
                ₹{card.value.toLocaleString()}
              </h3>
              <span className={`text-[9px] font-bold text-slate-400 block ${card.descClass || ''}`}>
                {card.description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
