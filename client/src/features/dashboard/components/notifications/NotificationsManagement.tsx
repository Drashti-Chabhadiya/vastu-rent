import {
  Bell,
  ChevronRight,
  Search,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Check,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '#/hook'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

export const NotificationsManagement = () => {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const userRole = session?.user?.role || 'owner'

  const { data: notifications, isLoading } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

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
        break
    }
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

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

  const filteredNotifs = notifications?.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'unread' && !n.isRead) ||
      n.type === filterType
    return matchesSearch && matchesFilter
  })

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">
            Notifications
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">
            Live System Alerts & Notifications
          </h1>
        </div>
      </div>

      {/* Main Grid: Content & Settings Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notifications List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-3 text-slate-400"
              />
              <Input
                placeholder="Search notifications..."
                className="h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-[11px] font-bold focus:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-10 bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none rounded-xl text-xs font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 transition-all">
                  <SelectValue placeholder="All Alerts" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <SelectItem value="all" className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer">All Alerts</SelectItem>
                  <SelectItem value="unread" className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer">Unread Only</SelectItem>
                  <SelectItem value="booking" className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer">Bookings</SelectItem>
                  <SelectItem value="payment" className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer">Payments</SelectItem>
                  <SelectItem value="alert" className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer">Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Loading alerts...
              </div>
            ) : filteredNotifs?.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No alerts matching your criteria.
              </div>
            ) : (
              filteredNotifs?.map((notif) => {
                const Icon = getIcon(notif.type)
                const colorCls = getColorClasses(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group ${!notif.isRead ? 'bg-slate-50/70 border-slate-100' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}
                      >
                        <Icon size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-[#1e293b]">
                          {notif.title}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Settings & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[15px] font-black text-[#1e293b] mb-1 uppercase tracking-widest">
              Notification Summary
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mb-8">
              System summary stats.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-blue-500" />
                  <span className="text-[11px] font-black text-slate-500">
                    Unread count
                  </span>
                </div>
                <span className="text-[11px] font-black text-[#1e293b]">
                  {unreadCount}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="link"
                onClick={handleMarkAllRead}
                className="w-full mt-8 text-[#15803d] hover:text-[#166534] text-[11px] font-extrabold flex items-center justify-center gap-2 hover:underline active:scale-[0.98] transition-all p-0 h-auto cursor-pointer"
              >
                <Check size={14} /> Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Handled globally in _authenticated.tsx layout wrapper
export function NotificationsManagementWrapper() {
  return <NotificationsManagement />
}
