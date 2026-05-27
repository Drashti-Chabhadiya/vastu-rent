import { StatCard } from './StatCard'
import {
  Building,
  Coins,
  ShoppingBag,
  Star,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface ListerOverviewProps {
  myListings: any[] | undefined
  listLoading: boolean
  listerOrders: any[] | undefined
  ordersLoading: boolean
  handleStatusUpdate: (
    id: string,
    status: 'approved' | 'rejected',
  ) => Promise<void>
}

export const ListerOverview = ({
  myListings,
  listLoading,
  listerOrders,
  ordersLoading,
  handleStatusUpdate,
}: ListerOverviewProps) => {
  const totalEarnings =
    listerOrders
      ?.filter((o: any) => o.status === 'approved' || o.status === 'completed')
      ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0

  const pendingOrders =
    listerOrders?.filter((o: any) => o.status === 'pending') || []

  // Compute average rating from all orders that have product reviews
  const allRatings: number[] = []
  listerOrders?.forEach((o: any) => {
    if (o.product?.reviews?.length) {
      o.product.reviews.forEach((r: any) => allRatings.push(r.rating))
    }
  })
  const avgRating =
    allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length).toFixed(1)
      : '—'

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
              'text-foreground',
              'tracking-tight',
              'mb-1',
            )}
          >
            Lister Dashboard
          </h1>
          <p className={cn('text-sm', 'text-muted-foreground/85', 'font-medium')}>
            Manage your rental properties, accept booking requests, and track
            payouts.
          </p>
        </div>
        <Link to="/products">
          <Button
            className={cn(
              'bg-primary',
              'hover:bg-primary/95',
              'text-primary-foreground',
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
            <Building size={18} />
            Add New Listing
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
          title="My Published Properties"
          value={listLoading ? '...' : myListings?.length?.toString() || '0'}
          change={`${myListings?.length ? 'Active' : 'No active listings'}`}
          isPositive={true}
          icon={Building}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[10, 15, 12, 18, 20, 24, myListings?.length || 0]}
        />
        <StatCard
          title="Total Generated Earnings"
          value={ordersLoading ? '...' : `₹ ${totalEarnings.toLocaleString()}`}
          change="Lister Balance"
          isPositive={true}
          icon={Coins}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[2000, 5000, 4500, 8000, 7500, 9000, totalEarnings]}
        />
        <StatCard
          title="Total Bookings Received"
          value={
            ordersLoading ? '...' : listerOrders?.length?.toString() || '0'
          }
          change={`${pendingOrders.length} Pending Approval`}
          isPositive={pendingOrders.length > 0}
          icon={ShoppingBag}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[5, 8, 7, 10, 9, 12, listerOrders?.length || 0]}
        />
        <StatCard
          title="Customer Review Rating"
          value={avgRating}
          change={avgRating !== '—' ? 'Avg. from reviews' : 'No reviews yet'}
          isPositive={true}
          icon={Star}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[
            4.5,
            4.6,
            4.7,
            4.8,
            4.8,
            4.9,
            parseFloat(avgRating) || 0,
          ]}
        />
      </div>

      {/* Dynamic Charts & Tables */}
      <div className={cn('grid', 'grid-cols-1', 'xl:grid-cols-3', 'gap-6')}>
        {/* Recent Booking Requests */}
        <div
          className={cn(
            'xl:col-span-2',
            'bg-card',
            'rounded-[2rem]',
            'border',
            'border-border/30',
            'shadow-sm',
            'p-6',
          )}
        >
          <div
            className={cn('flex', 'items-center', 'justify-between', 'mb-6')}
          >
            <div>
              <h3 className={cn('text-xl', 'font-black', 'text-foreground')}>
                Recent Booking Requests
              </h3>
              <p className={cn('text-xs', 'text-muted-foreground/85', 'font-medium')}>
                Review and process booking requests from tenants.
              </p>
            </div>
            {pendingOrders.length > 0 && (
              <span
                className={cn(
                  'bg-danger',
                  'text-destructive',
                  'px-3.5',
                  'py-1',
                  'rounded-xl',
                  'text-xs',
                  'font-black',
                  'animate-pulse',
                )}
              >
                {pendingOrders.length} Pending Action
              </span>
            )}
          </div>

          {ordersLoading ? (
            <div className={cn('space-y-4', 'py-8')}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-16',
                    'bg-muted-light',
                    'rounded-2xl',
                    'animate-pulse',
                  )}
                />
              ))}
            </div>
          ) : listerOrders && listerOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={cn('w-full', 'text-left', 'border-collapse')}>
                <thead>
                  <tr
                    className={cn(
                      'border-b',
                      'border-border/30',
                      'text-xs',
                      'font-bold',
                      'text-muted-foreground/70',
                      'uppercase',
                      'tracking-wider',
                    )}
                  >
                    <th className={cn('pb-3', 'font-semibold')}>Tenant</th>
                    <th className={cn('pb-3', 'font-semibold')}>Property</th>
                    <th className={cn('pb-3', 'font-semibold')}>Dates</th>
                    <th className={cn('pb-3', 'font-semibold')}>Earnings</th>
                    <th className={cn('pb-3', 'font-semibold')}>Status</th>
                    <th className={cn('pb-3', 'font-semibold', 'text-right')}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    'divide-y',
                    'divide-border/30',
                    'text-sm',
                    'font-medium',
                    'text-foreground/80',
                  )}
                >
                  {listerOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      className={cn('hover:bg-muted-light/50', 'transition-colors')}
                    >
                      <td className="py-4">
                        <div className={cn('flex', 'items-center', 'gap-3')}>
                          <div
                            className={cn(
                              'w-9',
                              'h-9',
                              'bg-primary/5',
                              'text-primary',
                              'rounded-xl',
                              'flex',
                              'items-center',
                              'justify-center',
                              'font-bold',
                              'text-xs',
                              'uppercase',
                            )}
                          >
                            {order.user?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className={cn('font-bold', 'text-foreground')}>
                              {order.user?.name || 'Renter'}
                            </p>
                            <p
                              className={cn(
                                'text-[10px]',
                                'text-muted-foreground/70',
                                'font-medium',
                              )}
                            >
                              {order.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'py-4',
                          'font-bold',
                          'text-foreground',
                          'truncate',
                          'max-w-[150px]',
                        )}
                      >
                        {order.product?.title || 'Property item'}
                      </td>
                      <td
                        className={cn(
                          'py-4',
                          'text-xs',
                          'font-semibold',
                          'text-muted-foreground/85',
                        )}
                      >
                        {new Date(order.startDate).toLocaleDateString()} -{' '}
                        {new Date(order.endDate).toLocaleDateString()}
                      </td>
                      <td className={cn('py-4', 'font-black', 'text-foreground')}>
                        ₹ {order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider',
                            order.status === 'pending'
                              ? 'bg-warning text-warning-foreground'
                              : order.status === 'approved'
                                ? 'bg-primary-soft text-primary'
                                : order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-muted/50 text-muted-foreground',
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className={cn('py-4', 'text-right')}>
                        {order.status === 'pending' ? (
                          <div
                            className={cn(
                              'flex',
                              'items-center',
                              'justify-end',
                              'gap-2',
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusUpdate(order.id, 'approved')
                              }
                              className={cn(
                                'w-8',
                                'h-8',
                                'rounded-lg',
                                'bg-primary-soft',
                                'text-primary',
                                'hover:bg-primary',
                                'hover:text-primary-foreground',
                                'flex',
                                'items-center',
                                'justify-center',
                                'transition-all',
                                'active:scale-[0.98]',
                              )}
                              title="Approve Booking"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusUpdate(order.id, 'rejected')
                              }
                              className={cn(
                                'w-8',
                                'h-8',
                                'rounded-lg',
                                'bg-danger',
                                'text-destructive',
                                'hover:bg-destructive/90',
                                'hover:text-primary-foreground',
                                'flex',
                                'items-center',
                                'justify-center',
                                'transition-all',
                                'active:scale-[0.98]',
                              )}
                              title="Reject Booking"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/70',
                              'font-bold',
                            )}
                          >
                            Processed
                          </span>
                        )}
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
              )}
            >
              <ShoppingBag
                size={48}
                className={cn('text-muted-dark', 'mb-4', 'animate-bounce')}
              />
              <h4 className={cn('font-bold', 'text-foreground', 'mb-1')}>
                No bookings received yet
              </h4>
              <p className={cn('text-xs', 'text-muted-foreground/85', 'max-w-xs')}>
                Publish your properties in the marketplace to get booking
                requests!
              </p>
            </div>
          )}
        </div>

        {/* Quick List Overview */}
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
            <h3
              className={cn('text-xl', 'font-black', 'text-foreground', 'mb-1')}
            >
              My Active Listings
            </h3>
            <p
              className={cn('text-xs', 'text-muted-foreground/85', 'font-medium', 'mb-6')}
            >
              Overview of your published marketplace rentals.
            </p>

            {listLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
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
            ) : myListings && myListings.length > 0 ? (
              <div className="space-y-3.5">
                {myListings.slice(0, 4).map((listing: any) => (
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
                          ₹ {listing.price.toLocaleString()} / day
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        listing.isAvailable
                          ? 'bg-primary shadow-sm shadow-green-500/20'
                          : 'bg-muted-dark/20',
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn('text-center', 'py-12')}>
                <Building size={48} className={cn('text-muted-dark', 'mb-4')} />
                <h4 className={cn('font-bold', 'text-foreground', 'mb-1')}>
                  No listings found
                </h4>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  Add your first property now.
                </p>
              </div>
            )}
          </div>

          <Link to="/account/orders" className="mt-6">
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
              View All Orders
              <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
