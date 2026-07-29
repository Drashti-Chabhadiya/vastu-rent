import { Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { ProductCard } from '#/components/common/ProductCard'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

interface WishlistGridItemProps {
  product: any
  clearConfirmId: string | null
  onRemove: (id: string) => void
  onClearConfirm: (id: string) => void
  onCancelClear: () => void
}

export function WishlistGridItem({
  product,
  clearConfirmId,
  onRemove,
  onClearConfirm,
  onCancelClear,
}: WishlistGridItemProps) {
  const { t } = useTranslation()

  return (
    <motion.div variants={fadeUp} className="relative group">
      <ProductCard product={product} />
      {clearConfirmId === product.id ? (
        <div className="absolute inset-0 bg-card/95 rounded-3xl flex flex-col items-center justify-center gap-3 z-10 animate-in fade-in duration-150">
          <p className="text-xs font-bold text-foreground/80 text-center px-4">
            {t('Remove from wishlist?')}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => onRemove(product.id)}
              variant="destructive"
              size="sm"
              className="h-8 px-4 text-xs"
            >
              {t('Remove')}
            </Button>
            <Button
              onClick={onCancelClear}
              variant="secondary"
              size="sm"
              className="h-8 px-4 text-xs"
            >
              {t('Cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => onClearConfirm(product.id)}
          variant="outline"
          size="icon"
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-card/90 backdrop-blur-sm border border-border/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-danger hover:border-danger/30 shadow-sm"
          title={t('Remove from wishlist')}
        >
          <Trash2
            size={13}
            className="text-muted-foreground/70 hover:text-destructive transition-colors"
          />
        </Button>
      )}
    </motion.div>
  )
}
