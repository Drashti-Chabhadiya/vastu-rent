import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole } from '#/lib/auth/roles'
import { useMyRentals, useWishlistProducts, useNotifications } from '#/hook'
import { DashboardOverviewSkeleton } from '#/components/skeletons'
import { RenterOverview } from './RenterOverview'
import { AdminOverview } from './AdminOverview'

interface DashboardOverviewProps {
  statsData: any
  statsLoading: boolean
  recentUsers: any[]
  usersLoading: boolean
  recentProducts: any[]
  productsLoading: boolean
}

export const DashboardOverview = ({
  statsData,
  statsLoading,
  recentUsers,
  usersLoading,
  recentProducts,
  productsLoading,
}: DashboardOverviewProps) => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const role = session?.user.role

  // User/Renter Hooks
  const { data: myRentals, isLoading: rentalsLoading } = useMyRentals()
  const { data: likedProducts, isLoading: likedLoading } = useWishlistProducts()

  // Shared Hooks
  const { data: notifications = [] } = useNotifications()

  // Render proper high-fidelity skeleton loaders while session or data is fetching
  if (isSessionLoading || !role) {
    return <DashboardOverviewSkeleton />
  }

  if (!isAdminRole(role) && (rentalsLoading || likedLoading)) {
    return <DashboardOverviewSkeleton />
  }

  if (isAdminRole(role) && (statsLoading || usersLoading || productsLoading)) {
    return <DashboardOverviewSkeleton />
  }

  if (isAdminRole(role)) {
    return (
      <AdminOverview
        statsData={statsData}
        statsLoading={statsLoading}
        recentUsers={recentUsers}
        usersLoading={usersLoading}
        recentProducts={recentProducts}
        productsLoading={productsLoading}
      />
    )
  }

  return (
    <RenterOverview
      myRentals={myRentals}
      rentalsLoading={rentalsLoading}
      likedProducts={likedProducts}
      likedLoading={likedLoading}
      notifications={notifications}
    />
  )
}
