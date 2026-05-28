import { useState } from 'react'
import { Heart, MapPin, Star, Package } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useWishlist } from '#/hook'
import { cn } from '#/lib/utils'

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
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { toggleLike, isLiked } = useWishlist()
  const liked = isLiked(product.id)
  const mainImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=800&q=80'

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="block group h-full"
    >
      <div className="bg-card rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-border/30 group-hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-[220px] rounded-xl bg-muted/50 mb-4 overflow-hidden shrink-0 flex items-center justify-center">
          {!imageError ? (
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
        </div>

        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          {product.title || product.name}
        </h3>

        <div className="flex items-end justify-between mb-3 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary-light">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-muted-foreground/85">
              /day
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-foreground/80">
              {product.rating || '5.0'}
            </span>
            <span className="text-xs font-medium text-muted-foreground/70">
              ({product.reviewsCount || '0'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground/85 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-medium truncate">
            {product.location || 'Ahmedabad'}
          </span>
        </div>

        <Button className="w-full shrink-0">Rent Now</Button>
      </div>
    </Link>
  )
}
