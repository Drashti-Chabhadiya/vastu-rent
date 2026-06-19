import { Outlet, Link, useRouterState } from '@tanstack/react-router'
import {
  User,
  Settings,
  Calendar,
  Star,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
  Leaf,
  ChevronRight,
  ChevronLeft,
  Building2,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/auth-client'
import { useNotifications } from '#/hook'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { AccountLayoutSkeleton } from '#/components/skeletons'
import { UserAvatar } from '#/components/common/UserAvatar'
import { Button } from '#/components/ui/button'
import { motion } from 'motion/react'
import { EASE } from '#/lib/animations'

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
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
export function AccountLayout() {
  const { data: sessionData, isPending: isLoading } = authClient.useSession()
  const session = sessionData || null
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const hash = routerState.location.hash
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 1023px)').matches
      : false,
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    setIsMobile(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const { data: notifications } = useNotifications()
  const { data: conversations } = useQuery<any[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/chat/conversations')
      return res.data
    },
    enabled: !!session?.user?.id,
    staleTime: 10_000,
  })

  const [lastActiveTab, setLastActiveTab] = useState<string | null>(null)

  const unreadCount = notifications
    ? notifications.filter((n: any) => !n.isRead).length
    : 0
  const unreadMessagesCount = conversations
    ? conversations.reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount || 0),
        0,
      )
    : 0

  const menuItems = [
    {
      id: 'personal',
      label: 'My Profile',
      icon: User,
      href: '/account',
      hash: 'personal',
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Calendar,
      href: '/account/bookings',
    },
    {
      id: 'listings',
      label: 'My Listings',
      icon: Building2,
      href: '/account/listings',
    },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/account/reviews' },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/account/messages',
      badge: unreadMessagesCount,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/account/notifications',
      badge: unreadCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/account/profile',
    },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  const currentActiveTab =
    menuItems.find((item) => {
      if (item.href === '/account') {
        if (isMobile) {
          return (
            pathname === '/account' &&
            (hash === 'personal' || hash === '#personal')
          )
        }
        return pathname === '/account' || pathname === '/account/'
      }
      return pathname === item.href
    })?.id || null

  useEffect(() => {
    if (currentActiveTab) {
      setLastActiveTab(currentActiveTab)
    }
  }, [currentActiveTab])

  const activeTab = currentActiveTab || (isMobile ? lastActiveTab : 'personal')

  const handleLogout = async () => {
    setLogoutLoading(true)
    await authClient.signOut()
    window.location.href = '/'
  }

  if (isLoading) return <AccountLayoutSkeleton />

  const isChatPage = pathname.startsWith('/account/messages')

  return (
    <>
      <div
        className={cn(
          'min-h-screen bg-background font-sans transition-all duration-300',
          isChatPage ? 'pt-0 lg:pt-16 pb-0 lg:pb-12' : 'pt-16 pb-12',
        )}
      >
        <div
          className={cn(
            'mx-auto max-w-[1400px] transition-all duration-300',
            isChatPage ? 'px-0 lg:px-8' : 'px-4 sm:px-6 lg:px-8',
          )}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className={cn(
                'w-full lg:w-[240px] shrink-0 bg-card rounded-3xl border border-border/30 pt-3 lg:pt-0 pb-4 px-2 shadow-sm flex flex-col justify-between min-h-[580px] overflow-hidden',
                (pathname !== '/account' || (hash !== '' && hash !== '#')) &&
                  'hidden lg:flex',
              )}
            >
              <div>
                {/* User Profile Card */}
                <div className="hidden lg:flex flex-col items-center gap-2 pt-5 pb-4 px-2 mb-2 border-b border-border/30">
                  <UserAvatar
                    image={session?.user?.image}
                    name={session?.user?.name || 'User'}
                    isOnline={true}
                    size="sidebar-large"
                    avatarClassName="border-2 border-border/30 shadow-sm"
                    showPing={false}
                  />
                  <div className="text-center min-w-0">
                    <p className="text-[12px] font-black text-foreground truncate max-w-[140px]">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-dark truncate max-w-[140px]">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
                <nav className="space-y-0.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        hash={item.hash}
                        className={cn(
                          'flex items-center gap-2.5 py-2.5 pr-3 pl-3 rounded-xl transition-all duration-200 group cursor-pointer text-[13px] font-semibold border-l-[3.5px]',
                          isActive
                            ? 'bg-primary-soft text-primary border-primary rounded-l-none pl-2.5 font-bold'
                            : 'text-muted-foreground hover:bg-muted-light hover:text-foreground border-transparent pl-[13.5px]',
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
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0 ml-auto border border-emerald-100">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}

                  {/* Log out — opens dialog */}
                  <Button
                    variant="ghost"
                    onClick={() => setLogoutOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-destructive hover:bg-danger hover:text-destructive transition-all font-semibold text-[13px] mt-1 cursor-pointer justify-start h-auto"
                  >
                    <LogOut
                      size={16}
                      className="shrink-0 text-destructive/80"
                    />
                    <span>Log out</span>
                  </Button>
                </nav>
              </div>

              {/* Grow bookings card */}
              <div className="relative overflow-hidden bg-primary-soft/40 rounded-2xl p-4.5 mt-4 mx-1 border border-primary-border/40 shadow-xs">
                {/* Background Leaf Watermark */}
                <svg
                  className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-primary/10 pointer-events-none fill-none"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10,90 C40,70 50,40 80,10 C50,20 20,50 10,90 Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <path
                    d="M10,90 L80,10 M30,65 C40,55 50,55 60,45 M50,45 C55,40 60,40 65,35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                  <path
                    d="M85,15 C75,25 70,35 72,45 C75,55 85,60 90,55 C95,50 90,25 85,15 Z"
                    fill="currentColor"
                    opacity="0.2"
                  />
                </svg>

                <div className="relative z-10 flex flex-col items-start gap-2">
                  <Leaf
                    size={16}
                    className="text-primary fill-primary/10 shrink-0"
                  />
                  <div>
                    <h4 className="font-display font-black text-foreground text-[13px] tracking-tight leading-tight">
                      Grow your bookings
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-normal mt-0.5">
                      List more. Earn more.
                    </p>
                  </div>
                  <Link
                    to="/help"
                    className="text-primary text-[10px] font-black flex items-center gap-0.5 mt-1.5 hover:opacity-80 transition-opacity"
                  >
                    View impact{' '}
                    <ChevronRight size={9} strokeWidth={3} className="mt-0.5" />
                  </Link>
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className={cn(
                'flex-1 min-w-0 w-full',
                isMobile && pathname === '/account' && hash === '' && 'hidden',
              )}
            >
              {isMobile &&
                (pathname !== '/account' || (hash !== '' && hash !== '#')) &&
                !isChatPage && (
                  <div className="lg:hidden flex items-center gap-2 mb-4 px-1">
                    <Link
                      to="/account"
                      className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:opacity-85"
                    >
                      <ChevronLeft
                        size={16}
                        strokeWidth={2.5}
                        className="mt-0.5"
                      />
                      <span>Back to Account Menu</span>
                    </Link>
                  </div>
                )}

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
            </motion.main>
          </div>
        </div>
      </div>

      {/* Logout dialog — rendered outside the layout flow */}
      <LogoutDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </>
  )
}
