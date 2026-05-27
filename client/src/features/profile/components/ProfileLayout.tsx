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
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

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
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-5">
          <LogOut size={28} className="text-primary" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-2">Log out</h2>
        <p className="text-[13px] text-muted-foreground/85 font-medium leading-relaxed mb-7">
          Are you sure you want to log out of your Vastu account?
        </p>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold mb-3 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-card/40 border-t-white rounded-full animate-spin" />
              Logging out...
            </>
          ) : (
            'Yes, log out'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full h-11 rounded-xl border border-border bg-card hover:bg-muted-light text-sm font-semibold text-foreground/80 transition-colors cursor-pointer disabled:opacity-60"
        >
          Cancel
        </Button>
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-border/30">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-8 font-medium">
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
      <div className="min-h-screen bg-background pt-16 pb-12 font-sans">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-full lg:w-[190px] shrink-0 bg-card rounded-2xl border border-border/30 pt-0 pb-4 px-2 shadow-sm flex flex-col justify-between min-h-[580px] overflow-hidden">
              <div>
                {/* User Profile Card */}
                <div className="flex flex-col items-center gap-2 pt-5 pb-4 px-2 mb-2 border-b border-border/30">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-border/30 shadow-sm">
                      <AvatarImage
                        src={session?.user?.image || ''}
                        alt={session?.user?.name}
                      />
                      <AvatarFallback className="bg-primary-soft text-primary font-black text-base">
                        {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Active green dot */}
                    <span
                      className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-primary border-2 border-card rounded-full shadow-sm"
                      title="Active"
                    />
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-[12px] font-black text-foreground truncate max-w-[140px]">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-dark truncate max-w-[140px]">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
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
                            ? 'bg-primary-soft text-primary'
                            : 'text-muted-foreground hover:bg-muted-light hover:text-foreground',
                        )}
                      >
                        <Icon
                          size={16}
                          className={cn(
                            'transition-colors shrink-0',
                            isActive
                              ? 'text-primary'
                              : 'text-muted-dark group-hover:text-foreground/80',
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}

                  {/* Log out — opens dialog */}
                  <Button
                    variant="ghost"
                    onClick={() => setLogoutOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-destructive hover:bg-danger hover:text-destructive transition-all font-semibold text-[13px] mt-1 cursor-pointer justify-start h-auto"
                  >
                    <LogOut size={16} className="shrink-0 text-destructive/80" />
                    <span>Log out</span>
                  </Button>
                </nav>
              </div>

              {/* Green Member Banner */}
              <div className="bg-primary-soft rounded-xl p-3 flex gap-2 items-start border border-primary-border mt-4 mx-1">
                <div className="w-7 h-7 rounded-full bg-primary-border flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Leaf size={13} fill="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-primary text-[11px]">
                    Green Member
                  </h4>
                  <p className="text-[10px] text-primary/80 font-semibold leading-normal mt-0.5">
                    You're saving the planet!
                  </p>
                  <Link
                    to="/help"
                    className="text-primary text-[10px] font-black flex items-center gap-0.5 mt-2 hover:underline"
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
                <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden min-h-[600px] p-8">
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
