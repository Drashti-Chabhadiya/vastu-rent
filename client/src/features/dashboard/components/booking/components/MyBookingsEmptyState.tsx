import { Calendar } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'

interface Props {
  activeTab: string
}

export const MyBookingsEmptyState = ({ activeTab }: Props) => {
  const { t } = useTranslation()
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-20',
        'bg-card',
        'rounded-[2.5rem]',
        'border',
        'border-dashed',
        'border-border',
      )}
    >
      <div
        className={cn(
          'w-16',
          'h-16',
          'bg-muted-light',
          'rounded-full',
          'flex',
          'items-center',
          'justify-center',
          'mb-4',
        )}
      >
        <Calendar className="text-muted-dark" size={32} />
      </div>
      <h3 className={cn('text-lg', 'font-extrabold', 'text-foreground/90')}>
        {t('No')} {t(activeTab)} {t('bookings')}
      </h3>
      <p
        className={cn(
          'text-muted-dark',
          'text-xs',
          'mt-1.5',
          'max-w-xs',
          'text-center',
          'font-bold',
        )}
      >
        {t("You don't have any bookings matching this status right now.")}
      </p>
    </motion.div>
  )
}
