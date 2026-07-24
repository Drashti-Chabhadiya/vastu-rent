import { Link } from '@tanstack/react-router'
import { Heart, Bookmark, ShoppingBag, Grid3X3 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

export function WishlistEmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-8">
        <div className="w-28 h-28 bg-danger rounded-full flex items-center justify-center shadow-inner">
          <Heart size={48} className="text-danger-foreground/45" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-warning rounded-full flex items-center justify-center animate-bounce shadow-sm">
          <Bookmark size={14} className="text-warning-foreground" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-foreground mb-2">
        {t('Your wishlist is empty')}
      </h2>
      <p className="text-sm text-muted-foreground/85 font-medium mb-8 max-w-xs leading-relaxed">
        {t(
          'Browse our catalogue and tap the heart icon on any item to save it here for later.',
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/products">
          <Button
            size="lg"
            className="flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <ShoppingBag size={16} />
            {t('Browse Catalogue')}
          </Button>
        </Link>
        <Link to="/" hash="categories">
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Grid3X3 size={16} />
            {t('Explore Categories')}
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-left w-full max-w-xl">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 mb-4 text-center">
          {t('Popular right now')}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            'Electronics',
            'Furniture',
            'Vehicles',
            'Cameras',
            'Appliances',
            'Tools',
          ].map((cat) => (
            <Link
              key={cat}
              to="/products"
              className="px-4 py-2 bg-card border border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
            >
              {t(cat)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
