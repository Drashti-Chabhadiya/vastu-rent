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
  )
}

export function NotificationsManagementWrapper() {
  return <NotificationsManagement />
}
