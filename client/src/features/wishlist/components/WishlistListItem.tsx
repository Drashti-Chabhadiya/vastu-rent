import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

interface WishlistListItemProps {
  product: any
  onRemove: (id: string) => void
}

export function WishlistListItem({ product, onRemove }: WishlistListItemProps) {
  const { t, formatNumber } = useTranslation()

  return (
    <motion.div
      variants={fadeUp}
      className="bg-card border border-border/30 rounded-2xl shadow-sm flex items-center gap-4 p-4 hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <Link to="/products/$id" params={{ id: product.id }} className="shrink-0">
        <img
          src={
            product.images?.[0] ||
            `https://placehold.co/80x80/f8f8f8/ccc?text=Item`
          }
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover bg-muted-light"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-black text-foreground text-sm truncate hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.category?.name && (
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md mt-1">
            {t(product.category.name)}
          </span>
        )}
        <p className="text-xs text-muted-foreground/85 mt-1.5 line-clamp-1">
          {product.description}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-sm font-black text-foreground">
          ₹{formatNumber(product.price ?? 0)}
          <span className="text-[10px] font-bold text-muted-foreground/70">
            {t('/day')}
          </span>
        </p>
        <div className="flex gap-2">
          <Link to="/products/$id" params={{ id: product.id }}>
            <Button size="sm" className="h-7 px-3 text-[11px] rounded-lg">
              {t('View')}
            </Button>
          </Link>
          <Button
            onClick={() => onRemove(product.id)}
            variant="outline"
            size="sm"
            className="h-7 px-3 text-[11px] rounded-lg bg-danger hover:bg-danger text-destructive hover:text-destructive border-none shadow-none active:scale-[0.98] transition-all"
          >
            {t('Remove')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
