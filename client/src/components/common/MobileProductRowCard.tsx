import { Link } from '@tanstack/react-router'
import { Star, MapPin, Heart, Store, Home } from 'lucide-react'
import { useWishlist } from '#/hook'
import { cn } from '#/lib/utils'

interface MobileProductRowCardProps {
  product: any
  className?: string
}

export function MobileProductRowCard({
  product,
  className,
}: MobileProductRowCardProps) {
  const { toggleLike, isLiked } = useWishlist()
  const liked = isLiked(product.id)
  const defaultCity = product.location?.split(',')[0] || product.city || 'Surat'

  const isShop =
    product.listingType === 'shop' ||
    product.owner?.address?.addressType?.toLowerCase() === 'shop' ||
    product.owner?.addresses?.[0]?.addressType?.toLowerCase() === 'shop' ||
    product.user?.address?.addressType?.toLowerCase() === 'shop' ||
    product.user?.addresses?.[0]?.addressType?.toLowerCase() === 'shop'

  const badgeLabel = isShop
    ? product.shopName || product.owner?.address?.shopName || 'Vastu Shop'
    : 'From Home'

  return (
    <div
      className={cn(
        'flex gap-3.5 p-3 bg-card rounded-[24px] border border-border shadow-xs relative transition-all active:scale-[0.99]',
        className,
      )}
    >
      {/* Thumbnail + Dynamic Badges */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-muted shrink-0">
        <img
          src={product.images?.[0] || '/assets/product-placeholder.png'}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        {/* Dynamic From Home / Vastu Shop Badge */}
        <div
          className={cn(
            'absolute bottom-1.5 left-1.5 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-xs border',
            isShop
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-800/40'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800/40',
          )}
        >
          {isShop ? (
            <Store
              size={10}
              className="shrink-0 text-amber-700 dark:text-amber-300"
              strokeWidth={2.5}
            />
          ) : (
            <Home
              size={10}
              className="shrink-0 text-emerald-700 dark:text-emerald-300"
              strokeWidth={2.5}
            />
          )}
          <span className="truncate max-w-[85px]">{badgeLabel}</span>
        </div>

        {/* Heart Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleLike(product.id)
          }}
          className={cn(
            'absolute top-1.5 right-1.5 w-6 h-6 rounded-full backdrop-blur flex items-center justify-center text-foreground hover:bg-card shadow-xs transition-transform active:scale-90',
            liked ? 'bg-danger text-destructive' : 'bg-card/80 text-foreground',
          )}
        >
          <Heart size={12} className={cn(liked && 'fill-current')} />
        </button>
      </div>

      {/* Product Information */}
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="flex-1 flex flex-col justify-between min-w-0 py-0.5 text-left"
      >
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-black text-foreground line-clamp-1">
            {product.title}
          </h4>
          <div className="text-sm font-extrabold text-foreground mt-0.5">
            ₹{product.price?.toLocaleString('en-IN') || product.price || '0'}
            <small className="text-[10px] text-muted-foreground font-normal">
              /day
            </small>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
            <div className="flex items-center gap-0.5">
              <MapPin size={10} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{defaultCity}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star
                size={10}
                className="fill-amber-500 text-amber-500 shrink-0"
              />
              <span>
                {product.averageRating || product.rating || '0.0'} (
                {product.reviewCount || '0'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-md text-[9px] font-bold">
              {product.category?.name || 'Camera'}
            </span>
            {product.subCategory && (
              <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-md text-[9px] font-bold">
                {product.subCategory}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
