import { StatCard } from './StatCard'
import { CalendarDays, IndianRupee, Heart, Clock, Compass } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'
import { ActiveRentalsTable } from './ActiveRentalsTable'
import { TopCities } from './TopCities'

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
              'group',
              'bg-primary',
              'hover:bg-primary/95',
              'text-primary-foreground',
              'font-bold',
              'h-12',
              'px-6',
              'rounded-full',
              'flex',
              'items-center',
              'justify-center',
              'gap-2',
              'shadow-lg',
              'shadow-primary/20',
              'transition-all',
              'active:scale-[0.98]',
              'border-none',
            )}
          >
            {t('Browse Properties')}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1 ml-1">
              <Compass size={16} strokeWidth={2} />
            </span>
          </Button>
        </Link>
      </div>

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
          value={rentalsLoading ? '...' : formatNumber(activeRentals.length)}
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
            likedLoading ? '...' : formatNumber(likedProducts?.length || 0)
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

      <div className={cn('grid', 'grid-cols-1', 'xl:grid-cols-3', 'gap-6')}>
        <ActiveRentalsTable
          myRentals={myRentals}
          rentalsLoading={rentalsLoading}
        />
        <TopCities />
      </div>
    </div>
  )
}
