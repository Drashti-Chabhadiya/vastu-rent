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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useTranslation } from '#/context/TranslationContext'

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
  const { t, formatNumber } = useTranslation()
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
              'text-foreground',
              'tracking-tight',
              'mb-1',
            )}
          >
            {t('Renter Portal')}
          </h1>
          <p
            className={cn('text-sm', 'text-muted-foreground/85', 'font-medium')}
          >
            {t(
              'Track your active rentals, saved properties, and booking schedules.',
            )}
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
            <Compass size={18} />
            {t('Browse Properties')}
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
          title={t('Active Rental Properties')}
          value={
            rentalsLoading
              ? '...'
              : formatNumber(activeRentals.length)
          }
          change={t('{count} Total Orders').replace(
            '{count}',
            formatNumber(myRentals?.length || 0),
          )}
          isPositive={activeRentals.length > 0}
          icon={CalendarDays}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[1, 0, 2, 1, 3, 2, activeRentals.length]}
        />
        <StatCard
          title={t('Total Renter Expenditure')}
          value={rentalsLoading ? '...' : `₹ ${formatNumber(totalSpent)}`}
          change={t('Processed Payments')}
          isPositive={true}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[1000, 3000, 2500, 5000, 4000, 6000, totalSpent]}
        />
        <StatCard
          title={t('Saved Wishlist Listings')}
          value={
            likedLoading
              ? '...'
              : formatNumber(likedProducts?.length || 0)
          }
          change={t('Favorites Bookmarked')}
          isPositive={true}
          icon={Heart}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[2, 4, 3, 5, 4, 6, likedProducts?.length || 0]}
        />
        <StatCard
          title={t('Account Notifications')}
          value={formatNumber(unreadCount)}
          change={unreadCount > 0 ? t('Unread Alerts') : t('All caught up')}
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
            'bg-card',
            'rounded-[2rem]',
            'border',
            'border-border/30',
            'shadow-sm',
            'p-6',
          )}
        >
          <div className="mb-6">
            <h3 className={cn('text-xl', 'font-black', 'text-foreground')}>
              {t('Active Rented Properties')}
            </h3>
            <p
              className={cn(
                'text-xs',
                'text-muted-foreground/85',
                'font-medium',
              )}
            >
              {t(
                'Timeline of your approved rentals currently active or upcoming.',
              )}
            </p>
          </div>

          {rentalsLoading ? (
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
          ) : myRentals && myRentals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/30 hover:bg-transparent">
                    <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                      {t('Listing')}
                    </TableHead>
                    <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                      {t('Landlord')}
                    </TableHead>
                    <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                      {t('Rental Dates')}
                    </TableHead>
                    <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                      {t('Rental Cost')}
                    </TableHead>
                    <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider text-right h-auto">
                      {t('Status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30 text-sm font-medium text-foreground/80">
                  {myRentals.map((rental: any) => (
                    <TableRow
                      key={rental.id}
                      className="hover:bg-muted-light/50 transition-colors border-b-0"
                    >
                      <TableCell className="py-4">
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
                              'bg-muted/50',
                            )}
                          />
                          <div>
                            <p className={cn('font-bold', 'text-foreground')}>
                              {rental.product?.title}
                            </p>
                            <p
                              className={cn(
                                'text-[10px]',
                                'text-muted-foreground/70',
                                'font-medium',
                              )}
                            >
                              {rental.product?.city || 'India'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-bold text-foreground">
                        {rental.product?.user?.name || 'Lister'}
                      </TableCell>
                      <TableCell className="py-4 text-xs font-semibold text-muted-foreground/85">
                        {new Date(rental.startDate).toLocaleDateString()} -{' '}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 font-black text-foreground">
                        ₹ {formatNumber(rental.totalPrice || 0)}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider',
                            rental.status === 'pending'
                              ? 'bg-warning text-warning-foreground'
                              : rental.status === 'approved'
                                ? 'bg-primary-soft text-primary'
                                : rental.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-muted/50 text-muted-foreground',
                          )}
                        >
                          {t(rental.status)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                'border-border/30',
                'rounded-3xl',
              )}
            >
              <CalendarDays
                size={48}
                className={cn('text-muted-dark', 'mb-4', 'animate-pulse')}
              />
              <h4 className={cn('font-bold', 'text-foreground', 'mb-1')}>
                {t('No active rentals yet')}
              </h4>
              <p
                className={cn(
                  'text-xs',
                  'text-muted-foreground/85',
                  'max-w-xs',
                  'mb-4',
                )}
              >
                {t(
                  "You haven't rented any property yet. Browse our listings to get started!",
                )}
              </p>
              <Link to="/products">
                <Button
                  className={cn(
                    'bg-primary',
                    'hover:bg-primary/95',
                    'text-primary-foreground',
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
                  {t('Explore Properties')}
                  <ArrowUpRight size={14} />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Liked Wishlist quick items */}
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
      </div>
    </div>
  )
}

