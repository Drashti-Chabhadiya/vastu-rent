import { useState } from 'react'
import {
  Bell,
  Calendar,
  ChevronDown,
  Menu,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '#/hook'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { authClient } from '#/lib/auth/auth-client'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) return format(date, 'h:mm a')
  if (diffHrs < 48) return 'Yesterday'
  return format(date, 'dd MMM')
}

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const userRole = session?.user?.role || 'owner'

  const { data: notifications = [], isLoading: isLoadingNotifications } =
    useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const [rangeType, setRangeType] = useState<'7days' | '30days' | 'thisMonth'>(
    '7days',
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return ShoppingCart
      case 'payment':
        return CreditCard
      case 'alert':
        return AlertCircle
      default:
        return Bell
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-emerald-50 text-emerald-600'
      case 'payment':
        return 'bg-amber-50 text-amber-500'
      case 'alert':
        return 'bg-rose-50 text-rose-500'
      default:
        return 'bg-slate-50 text-slate-500'
    }
  }

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markReadMutation.mutateAsync(notif.id)
    }

    // Dynamic Role-based navigation based on notification types
    switch (notif.type) {
      case 'booking':
        if (userRole === 'owner') {
          navigate({ to: '/account/orders' })
        } else {
          navigate({ to: '/account/bookings' })
        }
        break
      case 'payment':
        navigate({ to: '/account/payments' })
        break
      case 'info':
        navigate({ to: '/account/messages' })
        break
      default:
        navigate({ to: '/account/notifications' })
        break
    }
  }

  const getFormattedRange = () => {
    const endDate = new Date()
    const startDate = new Date()

    if (rangeType === '7days') {
      startDate.setDate(endDate.getDate() - 6)
    } else if (rangeType === '30days') {
      startDate.setDate(endDate.getDate() - 29)
    } else {
      // This Month
      startDate.setDate(1)
    }

    const formatMonthDay = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }

    return `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}, ${endDate.getFullYear()}`
  }

  const getLabel = () => {
    switch (rangeType) {
      case '7days':
        return 'Last 7 Days'
      case '30days':
        return 'Last 30 Days'
      case 'thisMonth':
        return 'This Month'
    }
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors lg:hidden active:scale-[0.98]"
        >
          <Menu size={22} />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-lg md:text-xl font-bold text-dash-text">
            Dashboard
          </h2>
          <p className="hidden md:block text-sm text-dash-text-muted">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Calendar size={18} className="text-dash-brand" />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {getLabel()}
              </span>
              <span className="text-xs font-bold text-[#1e293b]">
                {getFormattedRange()}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('7days')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === '7days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  Last 7 Days
                  {rangeType === '7days' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('30days')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === '30days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  Last 30 Days
                  {rangeType === '30days' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('thisMonth')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === 'thisMonth'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  This Month
                  {rangeType === 'thisMonth' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 hover:bg-gray-50 rounded-xl text-gray-500 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-white text-[9px] font-black flex items-center justify-center animate-in zoom-in duration-200">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-2xl bg-white border border-slate-100 shadow-2xl z-50 overflow-hidden mr-4">
            {/* Popover Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={13} className="text-[#2d5222]" /> Platform Alerts
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[10px] font-extrabold text-[#2d5222] hover:underline cursor-pointer border-none bg-transparent"
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending
                    ? 'Marking...'
                    : 'Mark all read'}
                </button>
              )}
            </div>

            {/* Popover List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50/70 scrollbar-thin">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2d5222]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-center px-4">
                  <Bell size={22} className="text-slate-200" />
                  <p className="text-[10px] font-bold text-slate-400">
                    All caught up! No alerts.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => {
                  const Icon = getIcon(notif.type)
                  const colorCls = getColorClasses(notif.type)
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'p-4 flex gap-3.5 items-start cursor-pointer hover:bg-slate-50/60 transition-colors',
                        !notif.isRead && 'bg-slate-50/30 font-semibold',
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
                          colorCls,
                        )}
                      >
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0 leading-tight">
                        <p className="text-[11px] font-black text-slate-800 truncate">
                          {notif.title}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[8px] font-black text-slate-300 block mt-1 uppercase tracking-wider">
                          {formatMsgTime(notif.createdAt)}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Popover Footer */}
            <div className="border-t border-slate-50 p-3 bg-slate-50/10 text-center">
              <button
                onClick={() => navigate({ to: '/account/notifications' })}
                className="text-[10px] font-black text-[#2d5222] hover:underline cursor-pointer border-none bg-transparent"
              >
                View all notifications ({notifications.length})
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
