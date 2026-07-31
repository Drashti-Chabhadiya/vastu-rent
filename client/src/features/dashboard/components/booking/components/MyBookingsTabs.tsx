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
    <>
      {/* MOBILE ROUNDED CHIPS (Screen 10 mockup style) */}
      <motion.div
        variants={fadeUp}
        className="flex md:hidden gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-black transition-all border whitespace-nowrap cursor-pointer shadow-xs',
                isActive
                  ? 'bg-primary text-white border-transparent'
                  : 'bg-card border-border/20 text-muted-foreground hover:bg-brand-beige/45',
              )}
            >
              {t(tab)} · {counts[tab]}
            </button>
          )
        })}
      </motion.div>

      {/* DESKTOP TABS */}
      <motion.div
        variants={fadeUp}
        className={cn(
          'hidden',
          'md:flex',
          'gap-6',
          'border-b',
          'border-border/30',
          'pb-px',
          'overflow-x-auto',
          'custom-scrollbar',
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
                isActive
                  ? 'text-primary'
                  : 'text-muted-dark hover:text-muted-foreground',
              )}
            >
              <span>
                {t(tab)} ({counts[tab]})
              </span>
              {isActive && (
                <div
                  className={cn(
                    'absolute',
                    'bottom-0',
                    'left-0',
                    'right-0',
                    'h-0.5',
                    'bg-primary',
                    'rounded-full',
                  )}
                />
              )}
            </Button>
          )
        })}
      </motion.div>
    </>
  )
}
