import {
  User,
  Settings,
  ShoppingBag,
  Package,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
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

  const menuItems = [
    { id: 'personal', label: 'Personal Info', icon: User, href: '/profile' },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: ShoppingBag,
      href: '/profile/bookings',
    },
    {
      id: 'listings',
      label: 'My Listings',
      icon: Package,
      href: '/profile/listings',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/profile/settings',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to view your profile and manage your rentals.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-bold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-4 mb-8 p-2">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand/20 shrink-0">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-lg">
                    {session.user.name || 'User'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate font-medium">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-brand/30'
                          : 'text-gray-600 hover:bg-primary/5 hover:text-primary',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={cn(
                            'transition-colors',
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-primary',
                          )}
                        />
                        <span className="font-bold text-[13px]">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={cn(
                          'transition-all duration-300',
                          isActive
                            ? 'text-white opacity-70 translate-x-1'
                            : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1',
                        )}
                      />
                    </Link>
                  )
                })}

                <button
                  onClick={() => authClient.signOut()}
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
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
