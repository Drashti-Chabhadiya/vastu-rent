import { cn } from '#/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '#/hook'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { isUserRole } from '#/lib/auth/roles'
import { useTranslation } from '#/context/TranslationContext'
import { NotificationsFilterBar } from './NotificationsFilterBar'
import { NotificationItem } from './NotificationItem'
import { NotificationsPagination } from './NotificationsPagination'
import { NotificationsSummaryCard } from './NotificationsSummaryCard'
import { EmptyNotificationsState } from './EmptyNotificationsState'
import { NotificationsManagementSkeleton } from '#/components/skeletons'
import { getNotificationIcon } from '#/lib/notification-utils'
import { ArrowLeft } from 'lucide-react'

export const NotificationsManagement = () => {
  const { t, formatNumber } = useTranslation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const userRole = session?.user?.role || 'user'

  const { data: notifications, isLoading } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterType])

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markReadMutation.mutateAsync(notif.id)
    }
    if (notif.url) {
      navigate({ to: notif.url })
      return
    }
    switch (notif.type) {
      case 'booking':
        navigate({
          to: isUserRole(userRole) ? '/account/orders' : '/account/bookings',
        })
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

  const totalItems = filteredNotifs?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotifs = filteredNotifs?.slice(startIndex, endIndex) || []
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const todayNotifs =
    filteredNotifs?.filter((n) => isToday(new Date(n.createdAt))) || []
  const earlierNotifs =
    filteredNotifs?.filter((n) => !isToday(new Date(n.createdAt))) || []

  const getCircleColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-primary'
      case 'saved':
      case 'favorite':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400'
      case 'message':
      case 'chat':
      case 'info':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
      default:
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
    }
  }

  return (
    <div
      className={cn(
        'space-y-5',
        'animate-in',
        'fade-in',
        'slide-in-from-bottom-4',
        'duration-500',
      )}
    >
      {/* MOBILE LAYOUT (Screen 14 mockup style) */}
      <div className="block md:hidden space-y-4">
        {/* Header Title & Mark All Read */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile inline back button */}
            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 rounded-full bg-muted/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-muted/75 shrink-0 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-display font-medium text-foreground tracking-tight">
              {t('Notifications')}
            </h1>
          </div>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="text-[11px] font-black text-muted-dark hover:text-foreground cursor-pointer transition-colors border-none bg-transparent shadow-none"
          >
            {t('Mark all read')}
          </button>
        </div>

        {isLoading ? (
          <NotificationsManagementSkeleton />
        ) : filteredNotifs?.length === 0 ? (
          <EmptyNotificationsState />
        ) : (
          <div className="space-y-6">
            {/* TODAY SECTION */}
            {todayNotifs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                  {t('Today')}
                </h3>
                <div className="bg-white dark:bg-card border border-border/15 rounded-[22px] p-2 divide-y divide-border/10 overflow-hidden shadow-xs">
                  {todayNotifs.map((notif) => {
                    const Icon = getNotificationIcon(notif.type)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted-light/10 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circular color icon */}
                          <div
                            className={cn(
                              'w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs',
                              getCircleColor(notif.type),
                            )}
                          >
                            <Icon size={14} strokeWidth={2.5} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-foreground leading-tight truncate">
                              {notif.title}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-warning shrink-0 ml-2 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* EARLIER SECTION */}
            {earlierNotifs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                  {t('Earlier')}
                </h3>
                <div className="bg-white dark:bg-card border border-border/15 rounded-[22px] p-2 divide-y divide-border/10 overflow-hidden shadow-xs">
                  {earlierNotifs.map((notif) => {
                    const Icon = getNotificationIcon(notif.type)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted-light/10 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circular color icon */}
                          <div
                            className={cn(
                              'w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs',
                              getCircleColor(notif.type),
                            )}
                          >
                            <Icon size={14} strokeWidth={2.5} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-foreground leading-tight truncate">
                              {notif.title}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-warning shrink-0 ml-2 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT (Original) */}
      <div className="hidden md:block space-y-5">
        <h2 className={cn('text-lg', 'font-black', 'text-foreground')}>
          {t('Platform Alerts')}
        </h2>

        <div className={cn('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-5')}>
          <div
            className={cn(
              'lg:col-span-2',
              'bg-card',
              'rounded-2xl',
              'border',
              'border-border/30',
              'shadow-sm',
              'overflow-hidden',
            )}
          >
            <NotificationsFilterBar
              search={search}
              onSearchChange={setSearch}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
            />

            <div className={cn('divide-y', 'divide-border/30')}>
              {isLoading ? (
                <NotificationsManagementSkeleton />
              ) : paginatedNotifs.length === 0 ? (
                <EmptyNotificationsState />
              ) : (
                paginatedNotifs.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={handleNotificationClick}
                  />
                ))
              )}
            </div>

            {totalItems > itemsPerPage && (
              <NotificationsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                formatNumber={formatNumber}
              />
            )}
          </div>

          <NotificationsSummaryCard
            unreadCount={unreadCount}
            onMarkAllRead={() => markAllReadMutation.mutate()}
            isPending={markAllReadMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}

export function NotificationsManagementWrapper() {
  return <NotificationsManagement />
}
