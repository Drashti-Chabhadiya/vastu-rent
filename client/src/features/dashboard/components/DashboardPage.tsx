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
import { MyBookings } from './booking/MyBookings'
import { RentalsCalendar } from './order/RentalsCalendar'
import { OrdersManagement } from './order/OrdersManagement'
import { PaymentsManagement } from './payments/PaymentsManagement'
import { DisputesManagement } from './disputes/DisputesManagement'
import { CouponsManagement } from './coupons/CouponsManagement'
import { NotificationsManagement } from './notifications/NotificationsManagement'
import { ReportsManagement } from './reports/ReportsManagement'
import { SettingsManagement } from './settings/SettingsManagement'
import { StoriesManagement } from './stories/StoriesManagement'
import { Button } from '#/components/ui/button'
import {
  useAdminStats,
  useAdminRecentUsers,
  useAdminRecentProducts,
} from '#/hook'
import { authClient } from '#/lib/auth/auth-client'

const DashboardPage = () => {
  const [currentTab, setCurrentTab] = useState('overview')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    string | null
  >(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const role = session?.user.role || 'owner'

  const isAdmin = role === 'admin' || role === 'superAdmin'

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

  const PlaceholderView = ({
    title,
    icon: Icon,
  }: {
    title: string
    icon: any
  }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-dash-brand/5 rounded-full flex items-center justify-center mb-6 relative">
        <Icon className="text-dash-brand" size={48} />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 border-4 border-white rounded-full animate-bounce"></div>
      </div>
      <h3 className="text-2xl font-black text-dash-text mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-dash-text-soft font-bold max-w-sm text-center px-6 leading-relaxed">
        We're currently building this feature to enhance your marketplace
        experience. Check back soon for updates!
      </p>
      <Button
        onClick={() => setCurrentTab('overview')}
        variant="outline"
        size="lg"
        className="mt-8 font-extrabold shadow-sm rounded-full"
      >
        Back to Overview
      </Button>
    </div>
  )

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
            role === 'owner' ? (
              <RentalsCalendar />
            ) : (
              <MyBookings />
            )
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
