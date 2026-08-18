import { Link, useRouterState } from '@tanstack/react-router'
import {
  Home,
  Search,
  Heart,
  User,
  Calendar,
  MessageSquare,
  Building2,
  LayoutDashboard,
} from 'lucide-react'
import { useWishlist, useConversations } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/auth-client'

export function Tabbar() {
  const { t } = useTranslation()
  const { count: wishlistCount } = useWishlist()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const { data: session } = authClient.useSession()
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'admin'

  // Query unread messages count if logged in
  const { data: conversations } = useConversations({
    enabled: isLoggedIn,
  })

  const unreadMessagesCount = Array.isArray(conversations)
    ? conversations.reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount || 0),
        0,
      )
    : 0

  const isHostingPath =
    pathname.startsWith('/account/listings') ||
    pathname.startsWith('/account/orders')

  const adminItems = isAdmin
    ? [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          to: '/admin/dashboard',
          isActive:
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/admin/dashboard'),
          badge: 0,
        },
      ]
    : []

  const navItems = isLoggedIn
    ? [
        ...adminItems,
        {
          label: 'Home',
          icon: Home,
          to: '/',
          isActive: pathname === '/' || pathname === '',
        },
        isHostingPath
          ? {
              label: 'Listings',
              icon: Building2,
              to: '/account/listings',
              isActive: pathname.startsWith('/account/listings'),
            }
          : {
              label: 'Bookings',
              icon: Calendar,
              to: '/account/bookings',
              isActive: pathname.startsWith('/account/bookings'),
            },
        {
          label: 'Messages',
          icon: MessageSquare,
          to: '/account/messages',
          isActive: pathname.startsWith('/account/messages'),
          badge: unreadMessagesCount,
        },
        {
          label: 'Profile',
          icon: User,
          to: '/account',
          isActive:
            pathname === '/account' ||
            pathname === '/account/' ||
            pathname.startsWith('/account/profile') ||
            pathname.startsWith('/account/notifications') ||
            pathname.startsWith('/account/settings'),
        },
      ]
    : [
        {
          label: 'Home',
          icon: Home,
          to: '/',
          isActive: pathname === '/' || pathname === '',
        },
        {
          label: 'Explore',
          icon: Search,
          to: '/products',
          isActive:
            pathname.startsWith('/products') ||
            pathname.startsWith('/categories'),
        },
        {
          label: 'Wishlist',
          icon: Heart,
          to: '/wishlist',
          isActive: pathname.startsWith('/wishlist'),
          badge: wishlistCount,
        },
        {
          label: 'Profile',
          icon: User,
          to: '/account',
          isActive:
            pathname.startsWith('/account') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup'),
        },
      ]

  return (
    <div
      className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      md:hidden
      border-t
      border-border/30
      bg-background/95
      backdrop-blur-md
      shadow-2xl
      supports-[backdrop-filter]:bg-background/80
    "
    >
      {/* <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4 pb-safe"> */}
      <div
        className="
    mx-auto
    flex
    max-w-md
    items-center
    justify-around
    px-4
    h-[72px]
    pb-[max(env(safe-area-inset-bottom),8px)]
  "
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300',
                item.isActive
                  ? 'text-primary'
                  : 'text-muted-foreground/80 hover:text-foreground',
              )}
            >
              {/* Animated Top Active Indicator Pill */}
              <span
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-primary transition-all duration-300 ease-out origin-center',
                  item.isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
              />

              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={item.isActive ? 2.5 : 2}
                  className={cn(
                    'transition-transform duration-300',
                    item.isActive && 'scale-110',
                  )}
                />
                {/* Count Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-warning-foreground border-2 border-background animate-in zoom-in-50 duration-200">
                    {item.badge > 99 ? '99' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[9.5px] font-bold tracking-wide transition-all duration-300">
                {t(item.label)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
