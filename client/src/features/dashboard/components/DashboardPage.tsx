import { useState, createContext, useContext } from 'react'
import { cn } from '#/lib/utils'
import { useNavigate, useRouterState, Outlet } from '@tanstack/react-router'
import { Sidebar } from './layout/Sidebar'
import { Header } from './layout/Header'
import {
  useAdminStats,
  useAdminRecentUsers,
  useAdminRecentProducts,
} from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole } from '#/lib/auth/roles'

export interface DashboardContextType {
  statsData: any
  statsLoading: boolean
  recentUsers: any[]
  usersLoading: boolean
  recentProducts: any[]
  productsLoading: boolean
  activeCategoryFilter: string | null
  handleManageCategory: (categoryId: string) => void
  setCurrentTab: (tab: string) => void
}

export const DashboardContext = createContext<DashboardContextType | null>(null)

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error(
      'useDashboardContext must be used within a DashboardProvider',
    )
  }
  return context
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    string | null
  >(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const role = session?.user.role || 'user'
  const isAdmin = isAdminRole(role)

  const getDashboardPrefix = () => {
    if (pathname.startsWith('/admin/dashboard')) return '/admin/dashboard'
    return '/dashboard'
  }

  const currentTab = (() => {
    const prefix = getDashboardPrefix()
    const relativePath = pathname.substring(prefix.length).replace(/^\//, '')
    return relativePath || 'overview'
  })()

  const setCurrentTab = (tab: string) => {
    const prefix = getDashboardPrefix()
    navigate({
      to: tab === 'overview' ? prefix : `${prefix}/${tab}`,
    })
  }

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
    <DashboardContext.Provider
      value={{
        statsData,
        statsLoading,
        recentUsers,
        usersLoading,
        recentProducts,
        productsLoading,
        activeCategoryFilter,
        handleManageCategory,
        setCurrentTab,
      }}
    >
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
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  )
}

export { DashboardPage }
