import React, { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  List,
  Grid,
  ShoppingCart,
  Calendar,
  CreditCard,
  AlertCircle,
  Bell,
  Settings,
  X,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Trash2,
  LogOut,
  ExternalLink,
  User,
  BookOpen,
  Ticket,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/auth-client'
import { Button } from '#/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

interface NavItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  hasSubmenu?: boolean
  onClick?: () => void
}

const NavItem = ({
  icon: Icon,
  label,
  active,
  hasSubmenu,
  onClick,
}: NavItemProps) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group active:scale-[0.98]',
      active
        ? 'bg-dash-brand-soft text-dash-brand shadow-sm'
        : 'text-dash-text-soft hover:bg-gray-50 hover:text-dash-text',
    )}
  >
    <div className="flex items-center gap-3">
      <Icon
        size={20}
        className={cn(
          'transition-colors',
          active
            ? 'text-dash-brand'
            : 'text-dash-text-muted group-hover:text-dash-text-soft',
        )}
      />
      <span className="text-[14px] font-bold tracking-tight">{label}</span>
    </div>
    {hasSubmenu && (
      <ChevronRight
        size={15}
        className={cn(
          'transition-colors opacity-0 group-hover:opacity-100 transition-all duration-300',
          active ? 'text-dash-brand opacity-100' : 'text-dash-text-muted',
        )}
      />
    )}
  </div>
)

// High-fidelity pulsing skeleton loader for when data/menu is rendering
const SidebarSkeleton = () => (
  <div className="space-y-3 px-4 py-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/70 border border-gray-50/30 animate-pulse"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-5 h-5 rounded bg-gray-200 shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
      </div>
    ))}
  </div>
)

// Sidebar menu item configurations mapping to each user role
const SIDEBAR_MENU_CONFIG: Record<
  string,
  { id: string; label: string; icon: React.ElementType; hasSub?: boolean }[]
> = {
  owner: [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: List, hasSub: true },
    { id: 'categories', label: 'Propose Categories', icon: Grid, hasSub: true },
    {
      id: 'orders',
      label: 'Booking Requests',
      icon: ShoppingCart,
      hasSub: true,
    },
    { id: 'bookings', label: 'Rentals Calendar', icon: Calendar, hasSub: true },
    {
      id: 'payments',
      label: 'Earnings Payouts',
      icon: CreditCard,
      hasSub: true,
    },
    { id: 'coupons', label: 'Manage Coupons', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users, hasSub: true },
    { id: 'listings', label: 'Manage Listings', icon: List, hasSub: true },
    { id: 'categories', label: 'Manage Categories', icon: Grid, hasSub: true },
    {
      id: 'stories',
      label: 'Stories (Catalogue)',
      icon: BookOpen,
      hasSub: true,
    },
    {
      id: 'disputes',
      label: 'Handle Disputes',
      icon: AlertCircle,
      hasSub: true,
    },
    { id: 'coupons', label: 'Manage Coupons', icon: Ticket },
    { id: 'notifications', label: 'Platform Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  superAdmin: [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Admins', icon: Users, hasSub: true },
    { id: 'listings', label: 'Manage Listings', icon: List, hasSub: true },
    { id: 'categories', label: 'Manage Categories', icon: Grid, hasSub: true },
    {
      id: 'stories',
      label: 'Stories (Catalogue)',
      icon: BookOpen,
      hasSub: true,
    },
    { id: 'delete-requests', label: 'Delete Requests', icon: Trash2 },
    {
      id: 'payments',
      label: 'Earnings & Payouts',
      icon: CreditCard,
      hasSub: true,
    },
    { id: 'coupons', label: 'Manage Coupons', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
}

interface SidebarProps {
  currentTab: string
  onTabChange: (tab: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose,
}: SidebarProps) => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const user = session?.user
  const role = user?.role || 'owner'
  const navigate = useNavigate()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  // Retrieve menus dynamically based on role; fallback if role is basic 'user' to owner stats
  const menuItems = SIDEBAR_MENU_CONFIG[role]

  return (
    <aside
      className={cn(
        'w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-[60] transition-transform duration-300',
        'lg:translate-x-0',
        isOpen
          ? 'translate-x-0 shadow-2xl animate-in slide-in-from-left duration-300'
          : '-translate-x-full',
      )}
    >
      {/* Logo & Close Button */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-dash-text tracking-tight leading-none">
              vastu-rent
            </h1>
            <p className="text-[9px] text-primary/70 font-black tracking-widest mt-1 uppercase">
              {role === 'superAdmin'
                ? 'Super Admin'
                : role === 'admin'
                  ? 'Admin'
                  : role === 'owner'
                    ? 'Owner'
                    : 'User'}{' '}
              Portal
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-600 rounded-xl w-8 h-8 hover:bg-gray-50"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Navigation Lists */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin">
        {isSessionLoading ? (
          <SidebarSkeleton />
        ) : (
          menuItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentTab === item.id}
              onClick={() => {
                onTabChange(item.id)
                if (onClose) onClose()
              }}
              hasSubmenu={item.hasSub}
            />
          ))
        )}
      </div>

      {/* Upgrade Promotional Widget for Owners/Listers */}
      {role === 'owner' && (
        <div className="p-4">
          <div className="bg-primary/5 rounded-2xl p-4 text-primary relative overflow-hidden group border border-primary/10 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-yellow-400/20 rounded-lg">
                  <TrendingUp size={14} className="text-yellow-600 font-bold" />
                </div>
                <span className="text-xs font-black tracking-wide text-primary">
                  Go Premium
                </span>
              </div>
              <p className="text-[11px] text-gray-600 font-medium mb-3 leading-relaxed">
                Unlock advance charts, calendar sync, and featured listing
                spots.
              </p>
              <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95">
                Upgrade Account
              </button>
            </div>
            {/* Soft background accents */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500"></div>
          </div>
        </div>
      )}

      {/* User Profile Section — interactive dropdown, professional standard */}
      <div ref={profileRef} className="p-4 border-t border-gray-100 relative">
        {/* Profile Dropdown Panel */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* User info header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={
                      user?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vastu'}`
                    }
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-100 bg-gray-50"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-dash-text truncate">
                    {user?.name || '—'}
                  </p>
                  <p className="text-[10px] text-dash-text-muted truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <button
                onClick={() => {
                  onTabChange('settings')
                  setIsProfileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-dash-text transition-colors"
              >
                <Settings size={15} className="text-gray-400" />
                Settings
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/account' })
                  setIsProfileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-dash-text transition-colors"
              >
                <User size={15} className="text-gray-400" />
                My Account
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/' })
                  setIsProfileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-dash-text transition-colors"
              >
                <ExternalLink size={15} className="text-gray-400" />
                View Public Site
              </button>
            </div>

            <div className="border-t border-gray-50 py-1.5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors group',
            isProfileOpen ? 'bg-gray-100' : 'hover:bg-gray-50',
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={
                  user?.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vastu'}`
                }
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-xl bg-gray-50 object-cover border border-gray-100"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-black text-dash-text truncate group-hover:text-primary transition-colors">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-[10px] text-dash-text-muted truncate uppercase font-extrabold tracking-wider">
                {role}
              </p>
            </div>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              'text-dash-text-muted shrink-0 transition-all duration-200',
              isProfileOpen
                ? 'rotate-180 text-dash-text'
                : 'group-hover:text-dash-text',
            )}
          />
        </button>
      </div>
    </aside>
  )
}
