import {
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  Headset,
  TicketX,
} from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

export function FeaturesBar() {
  const { t } = useTranslation()

  const features = [
    {
      icon: (
        <LayoutGrid
          className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80"
          strokeWidth={1.5}
        />
      ),
      title: t('Wide Range of Categories'),
    },
    {
      icon: (
        <ShieldCheck
          className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80"
          strokeWidth={1.5}
        />
      ),
      title: t('Secure payments'),
    },
    {
      icon: (
        <UserCheck
          className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80"
          strokeWidth={1.5}
        />
      ),
      title: t('Verified Users'),
    },
    {
      icon: (
        <Headset
          className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80"
          strokeWidth={1.5}
        />
      ),
      title: t('24/7 Support'),
    },
    {
      icon: (
        <TicketX
          className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80"
          strokeWidth={1.5}
        />
      ),
      title: t('Easy Cancellations'),
    },
  ]

  return (
    <section className="bg-background border-t border-b border-border/30 py-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3">
              {feature.icon}
              <span className="text-[10px] sm:text-xs font-semibold text-foreground/90 leading-tight">
                {feature.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
