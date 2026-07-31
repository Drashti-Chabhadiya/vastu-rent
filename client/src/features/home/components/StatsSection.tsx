import { useMemo } from 'react'
import { Home, Users, ShieldCheck, Star } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

export function StatsSection() {
  const { t, formatDigits } = useTranslation()

  const stats = useMemo(
    () => [
      {
        icon: (
          <Home
            className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            strokeWidth={1.5}
          />
        ),
        value: formatDigits('25,000+'),
        label: t('Items Available'),
      },
      {
        icon: (
          <Users
            className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            strokeWidth={1.5}
          />
        ),
        value: formatDigits('15,000+'),
        label: t('Happy Customers'),
      },
      {
        icon: (
          <ShieldCheck
            className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            strokeWidth={1.5}
          />
        ),
        value: formatDigits('98%'),
        label: t('Verified & Trusted'),
      },
      {
        icon: (
          <Star
            className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            strokeWidth={1.5}
          />
        ),
        value: formatDigits('4.8/5'),
        label: t('Customer Rating'),
      },
    ],
    [t, formatDigits],
  )

  return (
    <section className="bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm py-8 px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-border/30 bg-card shadow-sm">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
