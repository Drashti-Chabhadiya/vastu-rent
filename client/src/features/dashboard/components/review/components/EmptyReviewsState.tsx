import { Star } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'

interface EmptyReviewsStateProps {
  activeTab: string
}

const EmptyReviewsState = ({ activeTab }: EmptyReviewsStateProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-dashed border-border"
    >
      <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mb-4">
        <Star className="text-muted-dark fill-slate-300" size={32} />
      </div>
      <h3 className="text-lg font-extrabold text-foreground/90">
        {t('No')} {t(activeTab)} {t('reviews')}
      </h3>
      <p className="text-muted-dark text-xs mt-1.5 max-w-xs text-center font-bold">
        {t("You don't have any reviews listed under this category right now.")}
      </p>
    </motion.div>
  )
}

export default EmptyReviewsState
