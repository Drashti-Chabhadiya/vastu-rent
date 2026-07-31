import { useState } from 'react'
import { Heart, MapPin, Star, Package, Home, Store } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useWishlist } from '#/hook'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface ProductCardProps {
  product: {
    id: string
    title?: string
    name?: string
    price: number
    images?: string[]
    location?: string
    rating?: number
    reviewsCount?: number
    listingType?: 'home' | 'shop' | string
    shopName?: string
  }
  variant?: 'default' | 'mini'
}

export function ProductCard({
  product,
  variant = 'default',
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { toggleLike, isLiked } = useWishlist()
  const { formatCurrency, formatDigits, t } = useTranslation()
  const liked = isLiked(product.id)
  const mainImage = product.images?.[0]

  const isShop =
    product.listingType === 'shop' ||
    (product as any).owner?.address?.addressType?.toLowerCase() === 'shop' ||
    (product as any).owner?.addresses?.[0]?.addressType?.toLowerCase() ===
      'shop' ||
    (product as any).user?.address?.addressType?.toLowerCase() === 'shop' ||
    (product as any).user?.addresses?.[0]?.addressType?.toLowerCase() === 'shop'

  if (variant === 'mini') {
    return (
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="w-full shrink-0 bg-card border border-border/15 rounded-[20px] overflow-hidden flex flex-col justify-between shadow-3xs active:scale-[0.98] transition-all snap-start"
      >
        <div className="relative h-[100px] w-full bg-muted">
          {mainImage && !imageError ? (
            <img
              src={mainImage}
              alt={product.title || product.name}
              className="w-full h-full object-cover pointer-events-none"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-dark h-full">
              <Package size={24} className="opacity-20" />
            </div>
          )}
          {(() => {
            const displayShopName =
              product.shopName ||
              (product as any).owner?.address?.shopName ||
              (product as any).owner?.addresses?.[0]?.shopName ||
              (product as any).user?.address?.shopName ||
              (product as any).user?.addresses?.[0]?.shopName ||
              t('From Shop / Store')

            return (
              <div className="absolute bottom-2 left-2 z-10">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold backdrop-blur-md border shadow-xs',
                    isShop
                      ? 'bg-amber-50/90 text-amber-700 border-amber-200/60'
                      : 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
                  )}
                >
                  {isShop ? (
                    <Store className="w-2.5 h-2.5" strokeWidth={2.5} />
                  ) : (
                    <Home className="w-2.5 h-2.5" strokeWidth={2.5} />
                  )}
                  <span className="max-w-[70px] truncate">
                    {isShop ? displayShopName : t('From Home')}
                  </span>
                </span>
              </div>
            )
          })()}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleLike(product.id)
              }}
              className={cn(
                'w-6 h-6 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border-none',
                liked
                  ? 'bg-danger text-destructive hover:bg-danger hover:text-destructive scale-110'
                  : 'bg-card/90 text-muted-foreground hover:text-destructive hover:bg-card',
              )}
            >
              <Heart
                className={cn(
                  'w-3.5 h-3.5 transition-transform active:scale-90',
                  liked && 'fill-current',
                )}
              />
            </Button>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-extrabold text-[11px] line-clamp-1 leading-tight text-foreground">
              {product.title || product.name}
            </h4>
            <div className="flex items-center gap-1 text-muted-foreground/80">
              <MapPin size={10} className="shrink-0 text-muted-dark" />
              <span className="text-[9px] font-medium truncate">
                {formatDigits(
                  product.location || (product as any).city || 'Surat',
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-[12px] text-primary dark:text-[#10b981]">
              {formatCurrency(product.price)}
              <small className="font-normal text-[8px] text-muted-foreground">
                /day
              </small>
            </span>
            <div className="flex items-center gap-0.5 text-[9.5px] font-bold text-foreground">
              <Star
                size={9.5}
                className="fill-[#C97A45] text-[#C97A45] shrink-0"
              />
              <span>{formatDigits(product.rating || 0)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="block group h-full"
    >
      <div className="bg-card rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-border/30 group-hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-[220px] rounded-xl bg-muted/50 mb-4 overflow-hidden shrink-0 flex items-center justify-center">
          {mainImage && !imageError ? (
            <img
              src={mainImage}
              alt={product.title || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-dark gap-2">
              <Package size={48} className="opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                No Image
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleLike(product.id)
              }}
              className={cn(
                'w-10 h-10 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border-none',
                liked
                  ? 'bg-danger text-destructive hover:bg-danger hover:text-destructive scale-110'
                  : 'bg-card/90 text-muted-foreground hover:text-destructive hover:bg-card',
              )}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-transform active:scale-90',
                  liked && 'fill-current',
                )}
              />
            </Button>
          </div>
          {/* Listing Source Badge */}
          {(() => {
            const displayShopName =
              product.shopName ||
              (product as any).owner?.address?.shopName ||
              (product as any).owner?.addresses?.[0]?.shopName ||
              (product as any).user?.address?.shopName ||
              (product as any).user?.addresses?.[0]?.shopName ||
              t('From Shop / Store')

            return (
              <div className="absolute bottom-3 left-3 z-10">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border',
                    isShop
                      ? 'bg-amber-50/90 text-amber-700 border-amber-200/60'
                      : 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
                  )}
                >
                  {isShop ? (
                    <Store className="w-3 h-3" strokeWidth={2.5} />
                  ) : (
                    <Home className="w-3 h-3" strokeWidth={2.5} />
                  )}
                  <span className="max-w-[90px] truncate">
                    {isShop ? displayShopName : t('From Home')}
                  </span>
                </span>
              </div>
            )
          })()}
        </div>

        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          {product.title || product.name}
        </h3>

        <div className="flex items-end justify-between mb-3 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary-light">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs font-medium text-muted-foreground/85">
              {t('/day')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-foreground/80">
              {formatDigits(product.rating || 0)}
            </span>
            <span className="text-xs font-medium text-muted-foreground/70">
              ({formatDigits(product.reviewsCount || 0)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground/85 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-medium truncate">
            {formatDigits(product.location || (product as any).city || 'Surat')}
          </span>
        </div>

        <Button className="w-full shrink-0">{t('Rent Now')}</Button>
      </div>
    </Link>
  )
}
