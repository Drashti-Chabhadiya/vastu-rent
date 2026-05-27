import { StatCard } from './StatCard'
import {
  CalendarDays,
  IndianRupee,
  Heart,
  Clock,
  Compass,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface RenterOverviewProps {
  myRentals: any[] | undefined
  rentalsLoading: boolean
  likedProducts: any[] | undefined
  likedLoading: boolean
  notifications: any[]
}

export const RenterOverview = ({
  myRentals,
  rentalsLoading,
  likedProducts,
  likedLoading,
  notifications,
}: RenterOverviewProps) => {
  const totalSpent =
    myRentals
      ?.filter((r: any) => r.status === 'approved' || r.status === 'completed')
      ?.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0) || 0

  const activeRentals =
    myRentals?.filter((r: any) => r.status === 'approved') || []

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <div className={cn('space-y-8', 'animate-in', 'fade-in', 'duration-500')}>
      <div
        className={cn(
          'flex',
          'flex-col',
          'md:flex-row',
          'md:items-center',
          'justify-between',
          'gap-4',
        )}
      >
        <div>
          <h1
            className={cn(
              'text-3xl',
              'font-black',
              'text-gray-900',
              'tracking-tight',
              'mb-1',
            )}
          >
            Renter Portal
          </h1>
          <p className={cn('text-sm', 'text-gray-500', 'font-medium')}>
            Track your active rentals, saved properties, and booking schedules.
          </p>
        </div>
        <Link to="/products">
          <Button
            className={cn(
              'bg-primary',
              'hover:bg-primary/95',
              'text-white',
              'font-bold',
              'h-12',
              'px-6',
              'rounded-full',
              'flex',
              'items-center',
              'gap-2',
              'shadow-lg',
              'shadow-primary/20',
              'transition-all',
              'active:scale-95',
            )}
          >
            <Compass size={18} />
            Browse Properties
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div
        className={cn(
          'grid',
          'grid-cols-1',
          'sm:grid-cols-2',
          'xl:grid-cols-4',
          'gap-6',
        )}
      >
        <StatCard
          title="Active Rental Properties"
          value={rentalsLoading ? '...' : activeRentals.length.toString()}
          change={`${myRentals?.length || 0} Total Orders`}
          isPositive={activeRentals.length > 0}
          icon={CalendarDays}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[1, 0, 2, 1, 3, 2, activeRentals.length]}
        />
        <StatCard
          title="Total Renter Expenditure"
          value={rentalsLoading ? '...' : `₹ ${totalSpent.toLocaleString()}`}
          change="Processed Payments"
          isPositive={true}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[1000, 3000, 2500, 5000, 4000, 6000, totalSpent]}
        />
        <StatCard
          title="Saved Wishlist Listings"
          value={
            likedLoading ? '...' : likedProducts?.length?.toString() || '0'
          }
          change="Favorites Bookmarked"
          isPositive={true}
          icon={Heart}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[2, 4, 3, 5, 4, 6, likedProducts?.length || 0]}
        />
        <StatCard
          title="Account Notifications"
          value={unreadCount.toString()}
          change={unreadCount > 0 ? 'Unread Alerts' : 'All caught up'}
          isPositive={unreadCount === 0}
          icon={Clock}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[1, 2, 0, 3, 2, 4, unreadCount]}
        />
      </div>

      {/* Dynamic Panels */}
      <div className={cn('grid', 'grid-cols-1', 'xl:grid-cols-3', 'gap-6')}>
        {/* Active Rentals Table */}
        <div
          className={cn(
            'xl:col-span-2',
            'bg-white',
            'rounded-[2rem]',
            'border',
            'border-gray-100',
            'shadow-sm',
            'p-6',
          )}
        >
          <div className="mb-6">
            <h3 className={cn('text-xl', 'font-black', 'text-gray-900')}>
              Active Rented Properties
            </h3>
            <p className={cn('text-xs', 'text-gray-500', 'font-medium')}>
              Timeline of your approved rentals currently active or upcoming.
            </p>
          </div>

          {rentalsLoading ? (
            <div className={cn('space-y-4', 'py-8')}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-16',
                    'bg-gray-50',
                    'rounded-2xl',
                    'animate-pulse',
                  )}
                />
              ))}
            </div>
          ) : myRentals && myRentals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={cn('w-full', 'text-left', 'border-collapse')}>
                <thead>
                  <tr
                    className={cn(
                      'border-b',
                      'border-gray-50',
                      'text-xs',
                      'font-bold',
                      'text-gray-400',
                      'uppercase',
                      'tracking-wider',
                    )}
                  >
                    <th className={cn('pb-3', 'font-semibold')}>Listing</th>
                    <th className={cn('pb-3', 'font-semibold')}>Landlord</th>
                    <th className={cn('pb-3', 'font-semibold')}>
                      Rental Dates
                    </th>
                    <th className={cn('pb-3', 'font-semibold')}>Rental Cost</th>
                    <th className={cn('pb-3', 'font-semibold', 'text-right')}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    'divide-y',
                    'divide-gray-50',
                    'text-sm',
                    'font-medium',
                    'text-gray-700',
                  )}
                >
                  {myRentals.map((rental: any) => (
                    <tr
                      key={rental.id}
                      className={cn('hover:bg-gray-50/50', 'transition-colors')}
                    >
                      <td className="py-4">
                        <div className={cn('flex', 'items-center', 'gap-3')}>
                          <img
                            src={
                              rental.product?.images?.[0] ||
                              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'
                            }
                            alt={rental.product?.title}
                            className={cn(
                              'w-10',
                              'h-10',
                              'rounded-xl',
                              'object-cover',
                              'bg-gray-100',
                            )}
                          />
                          <div>
                            <p className={cn('font-bold', 'text-gray-900')}>
                              {rental.product?.title}
                            </p>
                            <p
                              className={cn(
                                'text-[10px]',
                                'text-gray-400',
                                'font-medium',
                              )}
                            >
                              {rental.product?.city || 'India'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={cn('py-4', 'font-bold', 'text-gray-900')}>
                        {rental.product?.owner?.name || 'Owner lister'}
                      </td>
                      <td
                        className={cn(
                          'py-4',
                          'text-xs',
                          'font-semibold',
                          'text-gray-500',
                        )}
                      >
                        {new Date(rental.startDate).toLocaleDateString()} -{' '}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </td>
                      <td className={cn('py-4', 'font-black', 'text-gray-900')}>
                        ₹ {rental.totalPrice?.toLocaleString()}
                      </td>
                      <td className={cn('py-4', 'text-right')}>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider',
                            rental.status === 'pending'
                              ? 'bg-amber-50 text-amber-600'
                              : rental.status === 'approved'
                                ? 'bg-green-50 text-primary'
                                : rental.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {rental.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={cn(
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'py-12',
                'text-center',
                'border',
                'border-dashed',
                'border-gray-100',
                'rounded-3xl',
              )}
            >
              <CalendarDays
                size={48}
                className={cn('text-gray-300', 'mb-4', 'animate-pulse')}
              />
              <h4 className={cn('font-bold', 'text-gray-900', 'mb-1')}>
                No active rentals yet
              </h4>
              <p className={cn('text-xs', 'text-gray-500', 'max-w-xs', 'mb-4')}>
                You haven't rented any property yet. Browse our listings to get
                started!
              </p>
              <Link to="/products">
                <Button
                  className={cn(
                    'bg-primary',
                    'hover:bg-primary/95',
                    'text-white',
                    'font-bold',
                    'h-10',
                    'px-4',
                    'rounded-full',
                    'text-xs',
                    'flex',
                    'items-center',
                    'gap-1',
                  )}
                >
                  Explore Properties
                  <ArrowUpRight size={14} />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Liked Wishlist quick items */}
        <div
          className={cn(
            'bg-white',
            'rounded-[2rem]',
            'border',
            'border-gray-100',
            'shadow-sm',
            'p-6',
            'flex',
            'flex-col',
            'justify-between',
          )}
        >
          <div>
            <h3
              className={cn('text-xl', 'font-black', 'text-gray-900', 'mb-1')}
            >
              Saved Favorites
            </h3>
            <p
              className={cn('text-xs', 'text-gray-500', 'font-medium', 'mb-6')}
            >
              List of properties bookmarked for later consideration.
            </p>

            {likedLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-12',
                      'bg-gray-50',
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
                      'border-gray-50',
                      'hover:bg-gray-50/50',
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
                          'bg-gray-100',
                          'shrink-0',
                        )}
                      />
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'font-bold',
                            'text-sm',
                            'text-gray-900',
                            'truncate',
                          )}
                        >
                          {listing.title}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            'text-gray-400',
                            'font-bold',
                          )}
                        >
                          ₹ {listing.price.toLocaleString()} / day
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/products/$id"
                      params={{ id: String(listing.id) }}
                    >
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
                <Heart size={48} className={cn('text-gray-300', 'mb-4')} />
                <h4 className={cn('font-bold', 'text-gray-900', 'mb-1')}>
                  Wishlist is empty
                </h4>
                <p className={cn('text-xs', 'text-gray-500')}>
                  Your liked listings will show up here.
                </p>
              </div>
            )}
          </div>

          <Link to="/wishlist" className="mt-6">
            <Button
              className={cn(
                'w-full',
                'bg-gray-50',
                'hover:bg-gray-100',
                'text-gray-700',
                'font-bold',
                'h-11',
                'rounded-full',
                'border',
                'border-gray-100',
                'transition-all',
                'flex',
                'items-center',
                'justify-center',
                'gap-1',
              )}
            >
              Manage Wishlist
              <Heart size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
