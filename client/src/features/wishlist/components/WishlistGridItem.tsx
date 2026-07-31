// import { Trash2 } from 'lucide-react'
// import { Button } from '#/components/ui/button'
import { ProductCard } from '#/components/common/ProductCard'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'
// import { useTranslation } from '#/context/TranslationContext'

interface WishlistGridItemProps {
  product: any
  clearConfirmId: string | null
  onRemove: (id: string) => void
  onClearConfirm: (id: string) => void
  onCancelClear: () => void
}

export function WishlistGridItem({
  product,
  // clearConfirmId,
  // onRemove,
  // onClearConfirm,
  // onCancelClear,
}: WishlistGridItemProps) {
  // const { t } = useTranslation()

  return (
    <motion.div variants={fadeUp} className="relative group h-full">
      <ProductCard product={product} variant="mini" />
    </motion.div>
  )
}
