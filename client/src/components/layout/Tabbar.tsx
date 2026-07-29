import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Search, Heart, User } from 'lucide-react'
import { useWishlist } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'
import { cn } from '#/lib/utils'

export function Tabbar() {
  const { t } = useTranslation()
  const { count: wishlistCount } = useWishlist()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const navItems = [
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
        pathname.startsWith('/products') || pathname.startsWith('/categories'),
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-[#faf9f5]/95 dark:bg-[#152019]/95 backdrop-blur-md shadow-2xl md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300',
                item.isActive
                  ? 'text-primary dark:text-[#10b981]'
                  : 'text-muted-foreground/80 hover:text-foreground',
              )}
            >
              {/* Animated Top Active Indicator Pill */}
              <span
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-primary dark:bg-[#10b981] transition-all duration-300 ease-out origin-center',
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
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c97a45] text-[8px] font-extrabold text-white border-2 border-[#faf9f5] dark:border-[#152019] animate-in zoom-in-50 duration-200">
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
