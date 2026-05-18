import { createFileRoute } from '@tanstack/react-router'
import { useWishlist, useWishlistProducts } from '#/hook'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductCardSkeleton } from '#/components/skeletons'
import { Heart, ShoppingBag } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/account/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { wishlist } = useWishlist()
  const { data: products, isLoading } = useWishlistProducts()

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">My Saved Wishlist</h1>
          <p className="text-sm text-gray-500">View and manage items you've bookmarked for later.</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
          <Heart className="w-4 h-4 fill-primary text-primary animate-pulse" />
          <span className="text-xs font-black">{wishlist.length} Saved</span>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-3xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Explore our wide range of items and save your favorites.
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 h-11 rounded-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
