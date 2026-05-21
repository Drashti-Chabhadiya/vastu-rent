import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import {
  ShieldAlert,
  ArrowLeft,
  Plus,
  Package,
  MapPin,
  IndianRupee,
  Star,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useMyListings, useDeleteProduct } from '#/hook'
import { cn } from '#/lib/utils'

export function ProfileListings() {
  const [session, setSession] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { data: listings, isLoading: isListingsLoading } = useMyListings()
  const deleteProduct = useDeleteProduct()

  useEffect(() => {
    authClient.getSession().then((res) => {
      setSession(res.data)
      setIsAuthLoading(false)
    })
  }, [])

  if (isAuthLoading || isListingsLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your listings...</p>
      </div>
    )
  }

  const isOwner =
    session?.user?.role === 'owner' ||
    session?.user?.role === 'admin' ||
    session?.user?.role === 'superAdmin'

  if (!isOwner) {
    return (
      <div className="p-8 lg:p-12 flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          You need to be a **Lister/Owner** to access this page. Please upgrade
          your account or contact support.
        </p>
        <Link to="/">
          <Button
            variant="outline"
            className="rounded-xl font-bold flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            My Listings
          </h1>
          <p className="text-gray-500 font-medium">
            You have {listings?.length || 0} active listings.
          </p>
        </div>
        <Link to={'/profile/listings/new'}>
          <Button className="bg-primary hover:bg-primary-hover text-white font-bold h-12 px-6 rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center gap-2">
            <Plus size={18} />
            Create New Listing
          </Button>
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="bg-primary/5 border border-brand/10 rounded-[32px] p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No listings yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Start earning by listing your unused items today. It's quick, easy,
            and secure.
          </p>
          <Link to={'/profile/listings/new'}>
            <Button className="bg-primary hover:bg-primary-hover text-white font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-brand/20">
              Create First Listing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((item: any) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={
                    item.images?.[0] ||
                    'https://placehold.co/600x400?text=No+Image'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm',
                      item.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white',
                    )}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {item.category?.name}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:bg-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm shrink-0">
                    <Star size={14} className="fill-current" />
                    {item.rating || 'New'}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <MapPin size={14} className="text-primary" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 text-base font-black">
                    <IndianRupee size={16} className="text-primary" />
                    {item.price}
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      / day
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link to={`/products/${item.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-10 font-bold border-gray-100 hover:bg-gray-50 hover:text-primary transition-all gap-2"
                    >
                      <ExternalLink size={14} />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this listing?')
                      ) {
                        deleteProduct.mutate(item.id)
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
