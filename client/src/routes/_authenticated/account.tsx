import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Package, 
  LogOut, 
  ChevronRight, 
  Ticket, 
  Bell, 
  Star,
  CreditCard
} from "lucide-react"
import { cn } from "#/lib/utils"
import { authClient } from "#/lib/auth/auth-client"
import { useState, useEffect } from "react"

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountLayout,
})

function AccountLayout() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  useEffect(() => {
    authClient.getSession().then((res) => {
      setSession(res.data)
      setIsLoading(false)
    })
  }, [])

  const menuItems = [
    { id: "personal", label: "Profile Summary", icon: User, href: "/account" },
    { id: "profile", label: "Edit Profile", icon: Settings, href: "/account/profile" },
    { id: "bookings", label: "My Bookings", icon: ShoppingBag, href: "/account/bookings" },
    { id: "coupons", label: "My Coupons", icon: Ticket, href: "/account/coupons" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/account/notifications" },
    { id: "reviews", label: "My Reviews", icon: Star, href: "/account/reviews" },
  ]

  // Add Lister options if owner/admin
  const role = session?.user?.role
  if (role === 'owner' || role === 'admin' || role === 'superAdmin') {
    menuItems.push(
      { id: "orders", label: "Rental Orders", icon: Package, href: "/account/orders" },
      { id: "payments", label: "Earnings Payouts", icon: CreditCard, href: "/account/payments" }
    )
  }

  const activeTab = menuItems.find(item => pathname === item.href)?.id || "personal"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] pt-24 pb-12 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-4 mb-8 p-2">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-lg">{session.user.name || 'User'}</h3>
                  <p className="text-xs text-gray-500 truncate font-medium">{session.user.email}</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      to={item.href as any}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/30" 
                          : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={cn("transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                        <span className="font-bold text-[13px]">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={cn("transition-all duration-300", isActive ? "text-white opacity-70 translate-x-1" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
                    </Link>
                  )
                })}
                
                <button
                  onClick={async () => {
                    await authClient.signOut()
                    window.location.href = '/'
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm mt-4"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
