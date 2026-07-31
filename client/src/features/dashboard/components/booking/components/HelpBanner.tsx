import { HelpCircle, ChevronRight, MessageSquare } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'

export const HelpBanner = () => {
  const { t } = useTranslation()
  return (
    <motion.div variants={fadeUp}>
      {/* Mobile: compact row */}
      <div className="md:hidden flex items-center gap-3 bg-[#EFF5EF] dark:bg-primary-soft/40 rounded-2xl px-4 py-3.5 border border-primary-border/30 shadow-xs">
        <div className="w-9 h-9 rounded-full bg-white dark:bg-card flex items-center justify-center text-primary shrink-0 shadow-3xs border border-border/20">
          <HelpCircle size={17} className="stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-extrabold text-foreground leading-tight">
            {t('Need help with a booking?')}
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 leading-tight">
            {t('Our support team is here to assist.')}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted-dark/60 shrink-0" />
      </div>

      {/* Desktop: full banner */}
      <div
        className={cn(
          'hidden',
          'md:flex',
          'bg-card',
          'rounded-[2.5rem]',
          'border',
          'border-border/30',
          'p-6',
          'flex-col',
          'sm:flex-row',
          'items-center',
          'justify-between',
          'gap-4',
          'mt-8',
          'shadow-sm',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-4', 'text-left')}>
          <div
            className={cn(
              'w-12',
              'h-12',
              'rounded-full',
              'bg-primary-soft',
              'flex',
              'items-center',
              'justify-center',
              'text-primary',
              'shrink-0',
              'border',
              'border-primary-border',
            )}
          >
            <HelpCircle size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className={cn('font-extrabold', 'text-foreground', 'text-sm')}>
              {t('Need help with your booking?')}
            </h4>
            <p
              className={cn(
                'text-muted-dark',
                'text-xs',
                'font-semibold',
                'mt-0.5',
              )}
            >
              {t('Our support team is here to assist you.')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className={cn(
            'rounded-full',
            'border-border',
            'text-foreground/80',
            'font-black',
            'px-6',
            'h-10',
            'flex',
            'items-center',
            'gap-1.5',
            'hover:bg-muted-light',
            'shadow-sm',
            'cursor-pointer',
          )}
        >
          <MessageSquare
            size={15}
            className={cn('text-muted-dark', 'shrink-0')}
          />
          {t('Contact Support')}
        </Button>
      </div>
    </motion.div>
  )
}
