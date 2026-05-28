import { authClient } from '#/lib/auth/auth-client'
import {
  useMyListings,
  useOrders,
  useUpdateRentalStatus,
  useMyRentals,
  useWishlistProducts,
  useNotifications,
} from '#/hook'
import { toast } from 'sonner'
import { DashboardOverviewSkeleton } from '#/components/skeletons'
import { ListerOverview } from './ListerOverview'
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

  // Owner/Lister Hooks
  const { data: myListings, isLoading: listLoading } = useMyListings()
  const { data: listerOrders, isLoading: ordersLoading } = useOrders()
  const updateRentalStatus = useUpdateRentalStatus()

  // User/Renter Hooks
  const { data: myRentals, isLoading: rentalsLoading } = useMyRentals()
  const { data: likedProducts, isLoading: likedLoading } = useWishlistProducts()

  // Shared Hooks
  const { data: notifications = [] } = useNotifications()

  const handleStatusUpdate = async (
    id: string,
    status: 'approved' | 'rejected',
  ) => {
    try {
      await updateRentalStatus.mutateAsync({ id, status })
      toast.success(`Booking request successfully ${status}!`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to update booking status')
    }
  }

  // Render proper high-fidelity skeleton loaders while session or data is fetching
  if (isSessionLoading || !role) {
    return <DashboardOverviewSkeleton />
  }

  if ((role === 'owner' || role === 'user') && (listLoading || ordersLoading)) {
    return <DashboardOverviewSkeleton />
  }

  if (
    (role === 'admin' || role === 'superAdmin') &&
    (statsLoading || usersLoading || productsLoading)
  ) {
    return <DashboardOverviewSkeleton />
  }

  // 1. OWNER / LISTER DASHBOARD OVERVIEW
  if (role === 'owner') {
    return (
      <ListerOverview
        myListings={myListings}
        listLoading={listLoading}
        listerOrders={listerOrders}
        ordersLoading={ordersLoading}
        handleStatusUpdate={handleStatusUpdate}
      />
    )
  }

  // 2. NORMAL USER / TENANT DASHBOARD OVERVIEW
  if (role === 'user') {
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

  // 3. ADMIN / SUPER ADMIN DASHBOARD OVERVIEW
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
