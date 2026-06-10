import { useParams } from '@tanstack/react-router'
import { useDashboardContext } from './DashboardPage'
import { DashboardOverview } from './overview/DashboardOverview'
import { UsersManagement } from './user/UsersManagement'
import { ListingsManagement } from './listing/ListingsManagement'
import { DeleteRequestsManagement } from './listing/DeleteRequestsManagement'
import { CategoryManagement } from './category/CategoryManagement'
import { ReviewsManagement } from './review/ReviewsManagement'
import { OrdersManagement } from './order/OrdersManagement'
import { PaymentsManagement } from './payments/PaymentsManagement'
import { DisputesManagement } from './disputes/DisputesManagement'
import { CouponsManagement } from './coupons/CouponsManagement'
import { NotificationsManagement } from './notifications/NotificationsManagement'
import { ReportsManagement } from './reports/ReportsManagement'
import { SettingsManagement } from './settings/SettingsManagement'
import { StoriesManagement } from './stories/StoriesManagement'
import { RentalsCalendar } from './order/RentalsCalendar'

export const DashboardTabContent = () => {
  const { tab } = useParams({ strict: false }) as any
  const context = useDashboardContext()
  const currentTab = tab || 'overview'

  switch (currentTab) {
    case 'overview':
      return (
        <DashboardOverview
          statsData={context.statsData}
          statsLoading={context.statsLoading}
          recentUsers={context.recentUsers}
          usersLoading={context.usersLoading}
          recentProducts={context.recentProducts}
          productsLoading={context.productsLoading}
          onViewAllUsers={() => context.setCurrentTab('users')}
          onViewAllListings={() => context.setCurrentTab('listings')}
        />
      )
    case 'users':
      return <UsersManagement />
    case 'listings':
      return (
        <ListingsManagement
          initialCategoryFilter={context.activeCategoryFilter}
        />
      )
    case 'categories':
      return (
        <CategoryManagement onManageCategory={context.handleManageCategory} />
      )
    case 'stories':
      return <StoriesManagement />
    case 'reviews':
      return <ReviewsManagement />
    case 'bookings':
      return <RentalsCalendar />
    case 'orders':
      return <OrdersManagement />
    case 'payments':
      return <PaymentsManagement />
    case 'disputes':
      return <DisputesManagement />
    case 'delete-requests':
      return <DeleteRequestsManagement />
    case 'coupons':
      return <CouponsManagement />
    case 'notifications':
      return <NotificationsManagement />
    case 'reports':
      return <ReportsManagement />
    case 'settings':
      return <SettingsManagement />
    default:
      return (
        <div className="flex items-center justify-center h-64 text-dash-text-muted">
          Content for {currentTab} is coming soon...
        </div>
      )
  }
}
