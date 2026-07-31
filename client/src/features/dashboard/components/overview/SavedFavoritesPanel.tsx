import { Heart, ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface Props {
  likedProducts: any[] | undefined
  likedLoading: boolean
}

export const SavedFavoritesPanel = ({ likedProducts, likedLoading }: Props) => {
  const { t, formatNumber } = useTranslation()

  return (
    <div
      className={cn(
        'bg-card',
        'rounded-[2rem]',
        'border',
        'border-border/30',
        'shadow-sm',
        'p-6',
        'flex',
        'flex-col',
        'justify-between',
      )}
    >
      <div>
        <h3 className={cn('text-xl', 'font-black', 'text-foreground', 'mb-1')}>
          {t('Saved Favorites')}
        </h3>
        <p
          className={cn(
            'text-xs',
            'text-muted-foreground/85',
            'font-medium',
            'mb-6',
          )}
        >
          {t('List of properties bookmarked for later consideration.')}
        </p>

        {likedLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-12',
                  'bg-muted-light',
                  'rounded-xl',
                  'animate-pulse',
                )}
              />
            ))}
          </div>
        ) : likedProducts && likedProducts.length > 0 ? (
          <div className="space-y-3.5">
            {likedProducts.slice(0, 3).map((listing: any) => (
              <div
                key={listing.id}
                className={cn(
                  'flex',
                  'items-center',
                  'justify-between',
                  'p-3',
                  'rounded-2xl',
                  'border',
                  'border-border/30',
                  'hover:bg-muted-light/50',
                  'transition-colors',
                )}
              >
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'gap-3',
                    'overflow-hidden',
                  )}
                >
                  <img
                    src={
                      listing.images?.[0] ||
                      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'
                    }
                    alt={listing.title}
                    className={cn(
                      'w-11',
                      'h-11',
                      'rounded-xl',
                      'object-cover',
                      'bg-muted/50',
                      'shrink-0',
                    )}
                  />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'font-bold',
                        'text-sm',
                        'text-foreground',
                        'truncate',
                      )}
                    >
                      {listing.title}
                    </p>
                    <p
                      className={cn(
                        'text-xs',
                        'text-muted-foreground/70',
                        'font-bold',
                      )}
                    >
                      ₹ {formatNumber(listing.price)} {t('/day')}
                    </p>
                  </div>
                </div>
                <Link to="/products/$id" params={{ id: String(listing.id) }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'w-8',
                      'h-8',
                      'rounded-lg',
                      'hover:bg-primary/5',
                      'text-primary',
                      'hover:text-primary',
                    )}
                  >
                    <ArrowUpRight size={16} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('text-center', 'py-12')}>
            <Heart size={48} className={cn('text-muted-dark', 'mb-4')} />
            <h4 className={cn('font-bold', 'text-foreground', 'mb-1')}>
              {t('Wishlist is empty')}
            </h4>
            <p className={cn('text-xs', 'text-muted-foreground/85')}>
              {t('Your liked listings will show up here.')}
            </p>
          </div>
        )}
      </div>

      <Link to="/wishlist" className="mt-6">
        <Button
          className={cn(
            'w-full',
            'bg-muted-light',
            'hover:bg-muted/50',
            'text-foreground/80',
            'font-bold',
            'h-11',
            'rounded-full',
            'border',
            'border-border/30',
            'transition-all',
            'flex',
            'items-center',
            'justify-center',
            'gap-1',
          )}
        >
          {t('Manage Wishlist')}
          <Heart size={16} />
        </Button>
      </Link>
    </div>
  )
}
