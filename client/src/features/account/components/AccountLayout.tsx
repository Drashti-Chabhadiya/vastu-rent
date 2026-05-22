import { Outlet, Link, useRouterState } from '@tanstack/react-router'
import {
  User,
  Settings,
  Calendar,
  Percent,
  Heart,
  Star,
  MessageSquare,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import { AccountLayoutSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'

// ─── Layout ──────────────────────────────────────────────────────────────────
export function AccountLayout() {
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

  if (isLoading) return <AccountLayoutSkeleton />

  const role = session?.user?.role
  const isLister = role === 'owner' || role === 'admin' || role === 'superAdmin'

  const menuItems = [
    { id: 'personal', label: 'My Profile', icon: User, href: '/account' },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, href: '/account/bookings' },
    isLister 
      ? { id: 'listings', label: 'My Listings', icon: Percent, href: '/profile/listings' }
      : { id: 'listings', label: 'Become a Host', icon: Percent, href: '/become-lister' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/account/reviews' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/account/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/account/profile' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  const activeTab =
    menuItems.find((item) => pathname === item.href || (item.href === '/account' && pathname === '/account/'))?.id || 'personal'

  return (
    <div className="min-h-screen bg-[#faf7f0] pt-24 pb-12 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="p-1">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group cursor-pointer',
                        isActive
                          ? 'bg-[#F4F8F1] text-[#2d5222]'
                          : 'text-foreground/70 hover:bg-accent/30 hover:text-foreground',
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'transition-colors shrink-0',
                          isActive
                            ? 'text-[#2d5222]'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      />
                      <span className="font-semibold text-sm">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}

                <button
                  onClick={async () => {
                    await authClient.signOut()
                    window.location.href = '/'
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-750 transition-all font-semibold text-sm mt-4 border-none shadow-none cursor-pointer text-left bg-transparent"
                >
                  <LogOut size={18} className="shrink-0" />
                  <span>Log out</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'personal' ? (
              <Outlet />
            ) : (
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] p-8">
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

