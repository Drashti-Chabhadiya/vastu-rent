import { StatCard } from './StatCard'
import { BookingsChart } from '../booking/BookingsChart'
import { CategoryDonut } from '../category/CategoryDonut'
import { RecentOrders } from '../order/RecentOrders'
import { UsersOverviewTable } from '../user/UsersOverviewTable'
import { RevenueChart } from './RevenueChart'
import { TopCities } from './TopCities'
import { RecentListingsTable } from '../listing/RecentListingsTable'
import { RecentReviews } from '../review/RecentReviews'
import { Users, Tag, ShoppingBag, IndianRupee } from 'lucide-react'
import { cn } from '#/lib/utils'

interface AdminOverviewProps {
  statsData: any
  statsLoading: boolean
  recentUsers: any[]
  usersLoading: boolean
  recentProducts: any[]
  productsLoading: boolean
}

export const AdminOverview = ({
  statsData,
  statsLoading,
  recentUsers,
  usersLoading,
  recentProducts,
  productsLoading,
}: AdminOverviewProps) => {
  const usersChange = statsData?.usersChange ?? 0
  const listingsChange = statsData?.listingsChange ?? 0
  const bookingsChange = statsData?.bookingsChange ?? 0
  const revenueChange = statsData?.revenueChange ?? 0

  const formatChange = (val: number) => {
    return `${val >= 0 ? '' : '-'}${Math.abs(val).toFixed(1)}%`
  }

  return (
    <div className={cn('space-y-6', 'md:space-y-8')}>
      {/* Top Stats Row */}
      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4', 'gap-4', 'md:gap-6')}>
        <StatCard
          title="Total Users"
          value={
            statsLoading
              ? '...'
              : statsData?.totalUsers?.toLocaleString() || '0'
          }
          change={statsLoading ? '...' : formatChange(usersChange)}
          isPositive={usersChange >= 0}
          icon={Users}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[30, 40, 35, 50, 45, 60, 55]}
        />
        <StatCard
          title="Total Listings"
          value={
            statsLoading
              ? '...'
              : statsData?.totalListings?.toLocaleString() || '0'
          }
          change={statsLoading ? '...' : formatChange(listingsChange)}
          isPositive={listingsChange >= 0}
          icon={Tag}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[40, 30, 45, 35, 55, 40, 50]}
        />
        <StatCard
          title="Total Bookings"
          value={
            statsLoading
              ? '...'
              : statsData?.totalBookings?.toLocaleString() || '0'
          }
          change={statsLoading ? '...' : formatChange(bookingsChange)}
          isPositive={bookingsChange >= 0}
          icon={ShoppingBag}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[20, 35, 30, 45, 40, 50, 45]}
        />
        <StatCard
          title="Total Revenue"
          value={
            statsLoading
              ? '...'
              : `₹ ${statsData?.totalRevenue?.toLocaleString() || '0'}`
          }
          change={statsLoading ? '...' : formatChange(revenueChange)}
          isPositive={revenueChange >= 0}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[50, 60, 55, 70, 65, 80, 75]}
        />
      </div>

      {/* Second Row: Bookings, Categories, Recent Orders */}
      <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3', 'gap-6')}>
        <div className={cn('md:col-span-1', 'xl:col-span-1')}>
          <BookingsChart />
        </div>
        <div className={cn('md:col-span-1', 'xl:col-span-1')}>
          <CategoryDonut />
        </div>
        <div className={cn('md:col-span-full', 'xl:col-span-1')}>
          <RecentOrders />
        </div>
      </div>

      {/* Third Row: Users Overview, Revenue Overview, Top Cities */}
      <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3', 'gap-6')}>
        <div className={cn('md:col-span-full', 'xl:col-span-1')}>
          <UsersOverviewTable users={recentUsers} isLoading={usersLoading} />
        </div>
        <div className={cn('md:col-span-1', 'xl:col-span-1')}>
          <RevenueChart />
        </div>
        <div className={cn('md:col-span-1', 'xl:col-span-1')}>
          <TopCities />
        </div>
      </div>

      {/* Fourth Row: Recent Listings, Recent Reviews */}
      <div className={cn('grid', 'grid-cols-1', 'xl:grid-cols-2', 'gap-6')}>
        <RecentListingsTable
          products={recentProducts}
          isLoading={productsLoading}
        />
        <RecentReviews />
      </div>
    </div>
  )
}
