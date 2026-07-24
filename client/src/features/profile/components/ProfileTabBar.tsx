import { motion } from 'motion/react'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'
import { User, MapPin, Shield, CreditCard } from 'lucide-react'
import { fadeUp } from '#/lib/animations'

export type ProfileTab = 'personal' | 'address' | 'security' | 'subscription'

interface ProfileTabBarProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

const TABS: Array<{ id: ProfileTab; label: string; icon: any }> = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'address', label: 'Rental Address', icon: MapPin },
  { id: 'security', label: 'Security & Preferences', icon: Shield },
  { id: 'subscription', label: 'Subscription Plan', icon: CreditCard },
]

export function ProfileTabBar({ activeTab, onTabChange }: ProfileTabBarProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      variants={fadeUp}
      className="flex gap-6 sm:gap-8 border-b border-border/30 pb-px overflow-x-auto scrollbar-none mb-6"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'pb-1 font-extrabold text-[13px] sm:text-sm transition-all relative shrink-0 bg-transparent border-none p-0 focus:outline-none cursor-pointer',
              isActive
                ? 'text-primary'
                : 'text-muted-dark hover:text-foreground/80',
            )}
          >
            <div className="flex items-center gap-2 pb-2">
              <Icon size={15} />
              <span>{t(tab.label)}</span>
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        )
      })}
    </motion.div>
  )
}
