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
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'
import { AccountLayoutSkeleton } from '#/components/skeletons'

// ─── Logout Confirmation Dialog ───────────────────────────────────────────────
function LogoutDialog({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#F4F8F1] flex items-center justify-center mb-5">
          <LogOut size={28} className="text-[#2d5222]" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Log out</h2>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-7">
          Are you sure you want to log out of your Vastu account?
        </p>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#2d5222] hover:bg-[#1e3a17] text-white text-sm font-bold mb-3 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Logging out...
            </>
          ) : (
            'Yes, log out'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export function ProfileLayout() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  useEffect(() => {
    authClient.getSession().then((res) => {
      setSession(res.data)
      setIsLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true)
    await authClient.signOut()
    window.location.href = '/'
  }

  const role = session?.user?.role
  const isLister = role === 'owner' || role === 'admin' || role === 'superAdmin'

  const menuItems = [
    { id: 'personal', label: 'My Profile', icon: User, href: '/account' },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Calendar,
      href: '/account/bookings',
    },
    isLister
      ? {
          id: 'listings',
          label: 'My Listings',
          icon: Percent,
          href: '/account/listings',
        }
      : {
          id: 'listings',
          label: 'Become a Host',
          icon: Percent,
          href: '/become-lister',
        },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/account/reviews' },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/account/messages',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/account/notifications',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/account/profile',
    },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  const activeTab =
    menuItems.find(
      (item) =>
        pathname === item.href ||
        (item.href === '/account' && pathname === '/account/'),
    )?.id || 'personal'

  if (isLoading) return <AccountLayoutSkeleton />

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
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
            <Button className="w-full rounded-full">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f3ee] pt-16 pb-12 font-sans">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-full lg:w-[190px] shrink-0 bg-white rounded-2xl border border-slate-100 py-4 px-2 shadow-sm flex flex-col justify-between min-h-[580px]">
              <div>
                <nav className="space-y-0">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-[13px] font-semibold',
                          isActive
                            ? 'bg-[#F4F8F1] text-[#2d5222]'
                            : 'text-[#64748b] hover:bg-slate-50 hover:text-gray-900',
                        )}
                      >
                        <Icon
                          size={16}
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

                  {/* Log out — opens dialog */}
                  <button
                    onClick={() => setLogoutOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-[13px] mt-1 border-none shadow-none cursor-pointer text-left bg-transparent"
                  >
                    <LogOut size={16} className="shrink-0 text-red-400" />
                    <span>Log out</span>
                  </button>
                </nav>
              </div>

              {/* Green Member Banner */}
              <div className="bg-[#f4f8f1] rounded-xl p-3 flex gap-2 items-start border border-[#e2edd8] mt-4 mx-1">
                <div className="w-7 h-7 rounded-full bg-[#e2edd8] flex items-center justify-center text-[#2d5222] shrink-0 mt-0.5">
                  <Leaf size={13} fill="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-[#2d5222] text-[11px]">
                    Green Member
                  </h4>
                  <p className="text-[10px] text-[#5c7a52] font-semibold leading-normal mt-0.5">
                    You're saving the planet!
                  </p>
                  <Link
                    to="/help"
                    className="text-[#2d5222] text-[10px] font-black flex items-center gap-0.5 mt-2 hover:underline"
                  >
                    View Impact <ChevronRight size={9} strokeWidth={3} />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 w-full">
              {activeTab === 'personal' ||
              activeTab === 'bookings' ||
              activeTab === 'listings' ||
              activeTab === 'reviews' ||
              activeTab === 'messages' ||
              activeTab === 'notifications' ||
              activeTab === 'settings' ? (
                <Outlet />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] p-8">
                  <Outlet />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Logout dialog */}
      <LogoutDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </>
  )
}
