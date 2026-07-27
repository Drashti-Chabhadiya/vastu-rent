import { motion } from 'motion/react'
import { stagger, fadeUp } from '#/lib/animations'
import { Eye, Calendar, Coins, Star, IndianRupee, TrendingUp } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface ListingsStatsRowProps {
  totalViews: number
  totalBookings: number
  totalEarnings: number
  avgRatingValue: string
}

export function ListingsStatsRow({ totalViews, totalBookings, totalEarnings, avgRatingValue }: ListingsStatsRowProps) {
  const { t } = useTranslation()
  const stats = [
    { icon: Eye, label: t('TOTAL VIEWS'), value: totalViews, trend: '+12%', trendColor: 'text-primary' },
    { icon: Calendar, label: t('TOTAL BOOKINGS'), value: totalBookings, trend: '+8%', trendColor: 'text-primary' },
    { icon: Coins, label: t('TOTAL EARNINGS'), value: `${totalEarnings.toLocaleString()}`, isEarning: true, trend: '+18%', trendColor: 'text-primary' },
    { icon: Star, label: t('AVERAGE RATING'), value: avgRatingValue, trend: t('Excellent performance'), trendColor: 'text-muted-dark' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div key={stat.label} variants={fadeUp}
            className="bg-background rounded-[1.8rem] border border-border/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary-border">
              <Icon size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-dark">{stat.label}</p>
              <h4 className="text-xl font-black text-foreground mt-0.5 flex items-center">
                {stat.isEarning ? <IndianRupee size={15} className="stroke-[3]" /> : null}
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </h4>
              <p className={`text-[9px] font-extrabold flex items-center gap-0.5 mt-0.5 ${stat.trendColor}`}>
                <TrendingUp size={10} className="stroke-[2.5]" /> {stat.trend}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
