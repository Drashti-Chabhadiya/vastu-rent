import {
  User,
  Settings,
  Calendar,
  Percent,
  Heart,
  Star,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
  Leaf,
  ChevronRight,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Link, Outlet } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'

interface ProfileLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export function ProfileLayout({ children, activeTab }: ProfileLayoutProps) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((res) => {
      setSession(res.data)
      setIsLoading(false)
    })
  }, [])

  const role = session?.user?.role
  const isLister = role === 'owner' || role === 'admin' || role === 'superAdmin'

  const menuItems = [
    { id: 'personal', label: 'My Profile', icon: User, href: '/account' },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, href: '/account/bookings' },
    isLister
      ? { id: 'listings', label: 'My Listings', icon: Percent, href: '/account/listings' }
      : { id: 'listings', label: 'Become a Host', icon: Percent, href: '/become-lister' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/account/reviews' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/account/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/account/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/account/profile' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8 font-medium">
            Please sign in to view your profile and manage your rentals.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full rounded-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-24 pb-12 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[620px]">
            <div>
              {/* User profile card in sidebar */}
              <div className="flex items-center gap-4 mb-6 p-2">
                <div className="w-12 h-12 rounded-xl bg-[#2d5222]/10 flex items-center justify-center text-[#2d5222] text-lg font-black shrink-0">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 truncate text-sm">
                    {session.user.name || 'User'}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate font-semibold">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer text-sm font-bold',
                        isActive
                          ? 'bg-[#F4F8F1] text-[#2d5222]'
                          : 'text-[#64748b] hover:bg-slate-50 hover:text-gray-900',
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'transition-colors shrink-0',
                          isActive
                            ? 'text-[#2d5222]'
                            : 'text-[#94a3b8] group-hover:text-gray-700',
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                <button
                  onClick={async () => {
                    await authClient.signOut()
                    window.location.href = '/'
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm mt-2 border-none shadow-none cursor-pointer text-left bg-transparent"
                >
                  <LogOut size={18} className="shrink-0 text-red-400" />
                  <span>Log out</span>
                </button>
              </nav>
            </div>

            {/* Green Member Banner */}
            <div className="bg-[#f4f8f1] rounded-[1.5rem] p-4 flex gap-3 items-start border border-[#e2edd8] mt-6">
              <div className="w-8 h-8 rounded-full bg-[#e2edd8] flex items-center justify-center text-[#2d5222] shrink-0 mt-0.5">
                <Leaf size={16} fill="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-[#2d5222] text-xs">
                  Green Member
                </h4>
                <p className="text-[10px] text-[#5c7a52] font-semibold leading-normal mt-0.5">
                  You're saving the planet!
                </p>
                <Link to="/help" className="text-[#2d5222] text-[10px] font-black flex items-center gap-0.5 mt-2.5 hover:underline">
                  View Impact <ChevronRight size={10} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full">
            {activeTab === 'personal' || activeTab === 'bookings' || activeTab === 'listings' || activeTab === 'reviews' || activeTab === 'messages' ? (
              <Outlet />
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] p-8">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
