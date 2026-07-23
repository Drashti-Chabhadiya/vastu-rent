import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'

interface Props {
  activeTab: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  counts: Record<'upcoming' | 'ongoing' | 'completed' | 'cancelled', number>
  onTabChange: (tab: 'upcoming' | 'ongoing' | 'completed' | 'cancelled') => void
}

const TABS = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const

export const MyBookingsTabs = ({ activeTab, counts, onTabChange }: Props) => {
  const { t } = useTranslation()
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'flex', 'gap-6', 'border-b', 'border-border/30', 'pb-px',
        'overflow-x-auto', 'custom-scrollbar',
      )}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab
        return (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => onTabChange(tab)}
            className={cn(
              'pb-3 font-extrabold text-[13px] capitalize transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent',
              isActive ? 'text-primary' : 'text-muted-dark hover:text-muted-foreground',
            )}
          >
            <span>
              {t(tab)} ({counts[tab]})
            </span>
            {isActive && (
              <div className={cn('absolute', 'bottom-0', 'left-0', 'right-0', 'h-0.5', 'bg-primary', 'rounded-full')} />
            )}
          </Button>
        )
      })}
    </motion.div>
  )
}
