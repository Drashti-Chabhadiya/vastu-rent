import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Sidebar } from './layout/Sidebar'
import { Header } from './layout/Header'
import { DashboardOverview } from './overview/DashboardOverview'
import { UsersManagement } from './user/UsersManagement'
import { ListingsManagement } from './listing/ListingsManagement'
import { CategoryManagement } from './category/CategoryManagement'
import { ReviewsManagement } from './review/ReviewsManagement'
import { DeleteRequestsManagement } from './listing/DeleteRequestsManagement'
import { OrdersManagement } from './order/OrdersManagement'
import { PaymentsManagement } from './payments/PaymentsManagement'
import { DisputesManagement } from './disputes/DisputesManagement'
import { CouponsManagement } from './coupons/CouponsManagement'
import { NotificationsManagement } from './notifications/NotificationsManagement'
import { ReportsManagement } from './reports/ReportsManagement'
import { SettingsManagement } from './settings/SettingsManagement'
import { StoriesManagement } from './stories/StoriesManagement'
import {
  useAdminStats,
  useAdminRecentUsers,
  useAdminRecentProducts,
} from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole } from '#/lib/auth/roles'
import { RentalsCalendar } from './order/RentalsCalendar'

const DashboardPage = () => {
  const [currentTab, setCurrentTab] = useState('overview')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    string | null
  >(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const isAdmin = isAdminRole(session?.user.role)

  const { data: statsData, isLoading: statsLoading } = useAdminStats({
    enabled: isAdmin,
  })
  const { data: recentUsers, isLoading: usersLoading } = useAdminRecentUsers({
    enabled: isAdmin,
  })
  const { data: recentProducts, isLoading: productsLoading } =
    useAdminRecentProducts({ enabled: isAdmin })

  const handleManageCategory = (categoryId: string) => {
    setActiveCategoryFilter(categoryId)
    setCurrentTab('listings')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen bg-dash-bg flex overflow-x-hidden">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab)
          setIsSidebarOpen(false) // Close sidebar on mobile after clicking
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-w-0',
          'lg:ml-64',
        )}
      >
        <Header onMenuClick={toggleSidebar} />

        <div className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          {currentTab === 'overview' ? (
            <DashboardOverview
              statsData={statsData}
              statsLoading={statsLoading}
              recentUsers={recentUsers}
              usersLoading={usersLoading}
              recentProducts={recentProducts}
              productsLoading={productsLoading}
            />
          ) : currentTab === 'users' ? (
            <UsersManagement />
          ) : currentTab === 'listings' ? (
            <ListingsManagement initialCategoryFilter={activeCategoryFilter} />
          ) : currentTab === 'categories' ? (
            <CategoryManagement onManageCategory={handleManageCategory} />
          ) : currentTab === 'stories' ? (
            <StoriesManagement />
          ) : currentTab === 'reviews' ? (
            <ReviewsManagement />
          ) : currentTab === 'delete-requests' ? (
            <DeleteRequestsManagement />
          ) : currentTab === 'bookings' ? (
            <RentalsCalendar />
          ) : currentTab === 'orders' ? (
            <OrdersManagement />
          ) : currentTab === 'payments' ? (
            <PaymentsManagement />
          ) : currentTab === 'disputes' ? (
            <DisputesManagement />
          ) : currentTab === 'coupons' ? (
            <CouponsManagement />
          ) : currentTab === 'notifications' ? (
            <NotificationsManagement />
          ) : currentTab === 'reports' ? (
            <ReportsManagement />
          ) : currentTab === 'settings' ? (
            <SettingsManagement />
          ) : (
            <div className="flex items-center justify-center h-64 text-dash-text-muted">
              Content for {currentTab} is coming soon...
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
export { DashboardPage }
