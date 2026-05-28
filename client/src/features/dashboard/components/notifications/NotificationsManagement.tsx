import {
  Bell,
  Search,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  CheckCheck,
  Info,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '#/hook'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { isUserRole } from '#/lib/auth/roles'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIcon(type: string) {
  switch (type) {
    case 'booking':
      return ShoppingCart
    case 'payment':
      return CreditCard
    case 'alert':
      return AlertCircle
    case 'info':
      return Info
    default:
      return Bell
  }
}

function getIconColors(type: string) {
  switch (type) {
    case 'booking':
      return 'bg-primary-soft text-primary'
    case 'payment':
      return 'bg-warning text-warning-foreground'
    case 'alert':
      return 'bg-danger text-danger-foreground'
    case 'info':
      return 'bg-info text-info-foreground'
    default:
      return 'bg-muted-light text-muted-dark'
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const NotificationsManagement = () => {
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
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
      {/* Section heading */}
      <h2 className={cn('text-lg', 'font-black', 'text-foreground')}>
        Live System Alerts &amp; Notifications
      </h2>

      {/* Two-column grid */}
      <div className={cn('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-5')}>
        {/* ── Left: Notifications list ── */}
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
          {/* Search + filter bar */}
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-3',
              'p-5',
              'border-b',
              'border-border/30',
            )}
          >
            <div className={cn('relative', 'flex-1')}>
              <Search
                size={13}
                className={cn(
                  'absolute',
                  'left-3',
                  'top-[11px]',
                  'text-muted-dark',
                )}
              />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'h-9',
                  'pl-9',
                  'pr-4',
                  'bg-muted-light',
                  'border-none',
                  'rounded-xl',
                  'text-[11px]',
                  'font-semibold',
                  'focus-visible:ring-1',
                  'focus-visible:ring-primary/20',
                )}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger
                className={cn(
                  'w-[130px]',
                  'h-9',
                  'bg-muted-light',
                  'border-none',
                  'rounded-xl',
                  'text-[11px]',
                  'font-semibold',
                  'text-muted-foreground',
                  'focus:ring-1',
                  'focus:ring-primary/20',
                  'shadow-none',
                  'cursor-pointer',
                )}
              >
                <SelectValue placeholder="All Alerts" />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  'rounded-xl',
                  'border-border/30',
                  'shadow-lg',
                  'p-1',
                )}
              >
                <SelectItem
                  value="all"
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'rounded-lg',
                    'cursor-pointer',
                  )}
                >
                  All Alerts
                </SelectItem>
                <SelectItem
                  value="unread"
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'rounded-lg',
                    'cursor-pointer',
                  )}
                >
                  Unread Only
                </SelectItem>
                <SelectItem
                  value="booking"
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'rounded-lg',
                    'cursor-pointer',
                  )}
                >
                  Bookings
                </SelectItem>
                <SelectItem
                  value="payment"
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'rounded-lg',
                    'cursor-pointer',
                  )}
                >
                  Payments
                </SelectItem>
                <SelectItem
                  value="alert"
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'rounded-lg',
                    'cursor-pointer',
                  )}
                >
                  Alerts
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className={cn('divide-y', 'divide-border/30')}>
            {isLoading ? (
              <div
                className={cn(
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'py-16',
                  'gap-3',
                )}
              >
                <div
                  className={cn(
                    'w-10',
                    'h-10',
                    'rounded-xl',
                    'bg-primary-soft',
                    'flex',
                    'items-center',
                    'justify-center',
                  )}
                >
                  <Bell
                    size={18}
                    className={cn('text-primary', 'animate-pulse')}
                  />
                </div>
                <p
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'text-muted-dark',
                  )}
                >
                  Loading notifications...
                </p>
              </div>
            ) : paginatedNotifs.length === 0 ? (
              <div
                className={cn(
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'py-16',
                  'gap-3',
                )}
              >
                <div
                  className={cn(
                    'w-10',
                    'h-10',
                    'rounded-xl',
                    'bg-muted-light',
                    'flex',
                    'items-center',
                    'justify-center',
                  )}
                >
                  <Bell size={18} className="text-muted-dark" />
                </div>
                <p
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'text-muted-dark',
                  )}
                >
                  No notifications found.
                </p>
              </div>
            ) : (
              paginatedNotifs.map((notif) => {
                const Icon = getIcon(notif.type)
                const colorCls = getIconColors(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-muted-light/60 group',
                      !notif.isRead && 'bg-primary-soft/40',
                    )}
                  >
                    <div
                      className={cn('flex', 'items-center', 'gap-3', 'min-w-0')}
                    >
                      {/* Unread dot */}
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          !notif.isRead ? 'bg-primary' : 'bg-transparent',
                        )}
                      />

                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          colorCls,
                        )}
                      >
                        <Icon size={16} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-[12px] truncate',
                            !notif.isRead
                              ? 'font-black text-foreground'
                              : 'font-semibold text-foreground/80',
                          )}
                        >
                          {notif.title}
                        </p>
                        <p
                          className={cn(
                            'text-[10px]',
                            'font-medium',
                            'text-muted-dark',
                            'mt-0.5',
                            'truncate',
                          )}
                        >
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px]',
                        'font-semibold',
                        'text-muted-dark',
                        'shrink-0',
                        'ml-4',
                      )}
                    >
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalItems > itemsPerPage && (
            <div
              className={cn(
                'flex',
                'flex-row',
                'items-center',
                'justify-between',
                'px-5',
                'py-3',
                'border-t',
                'border-border/30',
                'gap-2',
              )}
            >
              <p
                className={cn(
                  'text-[10px]',
                  'font-semibold',
                  'text-muted-dark',
                )}
              >
                Showing{' '}
                <span className={cn('font-black', 'text-foreground/80')}>
                  {startIndex + 1}
                </span>{' '}
                to{' '}
                <span className={cn('font-black', 'text-foreground/80')}>
                  {Math.min(endIndex, totalItems)}
                </span>{' '}
                of{' '}
                <span className={cn('font-black', 'text-foreground/80')}>
                  {totalItems}
                </span>{' '}
                notifications
              </p>
              <div className={cn('flex', 'items-center', 'gap-1.5')}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={cn(
                    'h-7',
                    'px-3',
                    'rounded-lg',
                    'text-[10px]',
                    'font-semibold',
                    'border-border',
                    'text-muted-foreground',
                    'hover:bg-muted-light',
                    'shadow-none',
                    'cursor-pointer',
                    'disabled:opacity-40',
                  )}
                >
                  Previous
                </Button>

                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`e-${idx}`}
                      className={cn(
                        'w-7',
                        'h-7',
                        'flex',
                        'items-center',
                        'justify-center',
                        'text-[10px]',
                        'text-muted-dark',
                      )}
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={`p-${page}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-[10px] font-semibold transition-all cursor-pointer p-0',
                        currentPage === page
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground'
                          : 'border border-border text-muted-foreground hover:bg-muted-light bg-card',
                      )}
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className={cn(
                    'h-7',
                    'px-3',
                    'rounded-lg',
                    'text-[10px]',
                    'font-semibold',
                    'border-border',
                    'text-muted-foreground',
                    'hover:bg-muted-light',
                    'shadow-none',
                    'cursor-pointer',
                    'disabled:opacity-40',
                  )}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary card ── */}
        <div className="space-y-4">
          <div
            className={cn(
              'bg-card',
              'rounded-2xl',
              'border',
              'border-border/30',
              'shadow-sm',
              'p-6',
            )}
          >
            <h3
              className={cn(
                'text-[11px]',
                'font-black',
                'text-foreground',
                'uppercase',
                'tracking-widest',
                'mb-0.5',
              )}
            >
              Notification Summary
            </h3>
            <p
              className={cn(
                'text-[10px]',
                'font-semibold',
                'text-muted-dark',
                'mb-5',
              )}
            >
              System summary stats.
            </p>

            {/* Unread count row */}
            <div
              className={cn(
                'flex',
                'items-center',
                'justify-between',
                'py-3',
                'border-b',
                'border-border/30',
              )}
            >
              <div className={cn('flex', 'items-center', 'gap-2.5')}>
                <div
                  className={cn(
                    'w-7',
                    'h-7',
                    'rounded-lg',
                    'bg-sky-50',
                    'flex',
                    'items-center',
                    'justify-center',
                  )}
                >
                  <Bell size={13} className="text-sky-500" />
                </div>
                <span
                  className={cn(
                    'text-[11px]',
                    'font-semibold',
                    'text-muted-foreground',
                  )}
                >
                  Unread count
                </span>
              </div>
              <span
                className={cn(
                  'text-[11px] font-black px-2 py-0.5 rounded-full',
                  unreadCount > 0
                    ? 'bg-primary-soft text-primary'
                    : 'bg-muted-light text-muted-dark',
                )}
              >
                {unreadCount}
              </span>
            </div>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className={cn(
                  'w-full',
                  'mt-4',
                  'flex',
                  'items-center',
                  'justify-center',
                  'gap-1.5',
                  'text-[11px]',
                  'font-black',
                  'text-primary',
                  'hover:underline',
                  'cursor-pointer',
                  'hover:bg-transparent',
                  'h-auto',
                  'disabled:opacity-50',
                )}
              >
                <CheckCheck size={13} />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsManagementWrapper() {
  return <NotificationsManagement />
}
