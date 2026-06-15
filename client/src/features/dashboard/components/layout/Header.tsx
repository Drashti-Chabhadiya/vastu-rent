import { useState } from 'react'
import { Bell, Calendar, ChevronDown, Menu } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
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
import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole, isUserRole } from '#/lib/auth/roles'
import { formatMsgTime } from '#/lib/chat-utils'
import { formatMonthDay, getRangeLabel } from '#/lib/date-utils'
import {
  getNotificationIcon,
  getHeaderNotificationColorClasses,
} from '#/lib/notification-utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const userRole = session?.user?.role || 'user'
  const isAdmin = isAdminRole(userRole)

  const { data: notifications = [], isLoading: isLoadingNotifications } =
    useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const [rangeType, setRangeType] = useState<'7days' | '30days' | 'thisMonth'>(
    '7days',
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markReadMutation.mutateAsync(notif.id)
    }

    // Dynamic Role-based navigation based on notification types
    switch (notif.type) {
      case 'booking':
        if (isUserRole(userRole)) {
          navigate({ to: '/account/orders' })
        } else if (isAdmin) {
          navigate({ to: '/account/bookings' })
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

    return `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}, ${endDate.getFullYear()}`
  }

  return (
    <header className="h-20 bg-card/80 backdrop-blur-lg supports-backdrop-filter:bg-card/60 border-b border-border/30/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 hover:bg-muted-light rounded-lg text-muted-foreground/85 transition-colors lg:hidden active:scale-[0.98]"
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
            className="hidden lg:flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl hover:border-border/120 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Calendar size={18} className="text-dash-brand" />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                {getRangeLabel(rangeType)}
              </span>
              <span className="text-xs font-bold text-foreground">
                {getFormattedRange()}
              </span>
            </div>
            <ChevronDown size={14} className="text-muted-foreground/70 ml-1" />
          </div>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border/30 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('7days')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-muted-light ${
                    rangeType === '7days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground/80'
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
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-muted-light ${
                    rangeType === '30days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground/80'
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
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-muted-light ${
                    rangeType === 'thisMonth'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground/80'
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
              className="relative h-10 w-10 hover:bg-muted-light rounded-xl text-muted-foreground/85 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive border-2 border-card rounded-full text-destructive-foreground text-[9px] font-black flex items-center justify-center animate-in zoom-in duration-200">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-2xl bg-card border border-border/30 shadow-2xl z-50 overflow-hidden mr-4">
            {/* Popover Header */}
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between bg-muted-light/20">
              <span className="text-xs font-black text-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={13} className="text-primary" /> Platform Alerts
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[10px] font-extrabold text-primary hover:underline cursor-pointer h-auto p-0 hover:bg-transparent"
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending
                    ? 'Marking...'
                    : 'Mark all read'}
                </Button>
              )}
            </div>

            {/* Popover List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/30/70 scrollbar-thin">
              {isLoadingNotifications ? (
                <div className="divide-y divide-border/30">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-4 flex gap-3.5 items-start">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Skeleton className="h-2.5 w-1/3 rounded" />
                        <Skeleton className="h-2 w-2/3 rounded" />
                        <Skeleton className="h-1.5 w-12 rounded mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-center px-4">
                  <Bell size={22} className="text-muted-foreground/30" />
                  <p className="text-[10px] font-bold text-muted-dark">
                    All caught up! No alerts.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => {
                  const Icon = getNotificationIcon(notif.type)
                  const colorCls = getHeaderNotificationColorClasses(notif.type)
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'p-4 flex gap-3.5 items-start cursor-pointer hover:bg-muted-light/60 transition-colors',
                        !notif.isRead && 'bg-muted-light/30 font-semibold',
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
                        <p className="text-[11px] font-black text-foreground/90 truncate">
                          {notif.title}
                        </p>
                        <p className="text-[9px] font-bold text-muted-dark mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[8px] font-black text-muted-dark block mt-1 uppercase tracking-wider">
                          {formatMsgTime(notif.createdAt)}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-info-foreground mt-1.5 shrink-0" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Popover Footer */}
            <div className="border-t border-border/30 p-3 bg-muted-light/10 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/account/notifications' })}
                className="text-[10px] font-black text-primary hover:underline cursor-pointer h-auto p-0 hover:bg-transparent"
              >
                View all notifications ({notifications.length})
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
