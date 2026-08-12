import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { UserAvatar } from '#/components/common/UserAvatar'
import { Button } from '#/components/ui/button'
import {
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Calendar,
  Percent,
  Star,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { isAdminRole } from '#/lib/auth/roles'
import { useMyListings } from '#/hook'

interface NavUserDropdownProps {
  session: any
  onSignOut: () => void
  t: (key: string) => string
}

export function NavUserDropdown({
  session,
  onSignOut,
  t,
}: NavUserDropdownProps) {
  const { data: myListings } = useMyListings()
  const hasListings = myListings && myListings.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'relative',
            'flex',
            'items-center',
            'gap-2',
            'p-0.5',
            'pr-1.5',
            'h-auto',
            'hover:bg-muted/50',
            'transition-all',
            'active:scale-95',
          )}
        >
          <UserAvatar
            image={session.user.image}
            name={session.user.name}
            isOnline={true}
            showPing={false}
          />
          <ChevronDown
            className={cn(
              'hidden',
              'sm:block',
              'h-4',
              'w-4',
              'text-muted-dark',
              'transition-transform',
              'group-data-[state=open]:rotate-180',
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-64',
          'p-3',
          'rounded-2xl',
          'bg-card',
          'border',
          'border-border',
          'shadow-lg',
        )}
        align="end"
        sideOffset={12}
      >
        <div className="space-y-3">
          {/* User Profile Header */}
          <Link
            to="/account"
            hash="personal"
            className={cn(
              'flex',
              'items-center',
              'gap-3',
              'p-2',
              'rounded-xl',
              'transition-colors',
              'hover:bg-muted-light',
            )}
          >
            <UserAvatar
              image={session.user.image}
              name={session.user.name}
              size="lg"
              avatarClassName="border border-border"
            />
            <div className={cn('flex-1', 'min-w-0')}>
              <div
                className={cn('flex', 'items-center', 'gap-1.5', 'flex-wrap')}
              >
                <span
                  className={cn(
                    'font-bold',
                    'text-foreground',
                    'text-sm',
                    'truncate',
                  )}
                >
                  {session.user.name}
                </span>
                <p
                  className={cn(
                    'text-xs',
                    'text-muted-foreground/85',
                    'truncate',
                  )}
                >
                  {session.user.email}
                </p>
              </div>

              <span
                className={cn(
                  'inline-flex',
                  'items-center',
                  'gap-0.5',
                  'rounded-full',
                  'bg-primary-soft/80',
                  'px-1.5',
                  'py-0.5',
                  'text-[8px]',
                  'font-bold',
                  'text-primary-hover',
                )}
              >
                <svg
                  className={cn('h-2', 'w-2')}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('Verified')}
              </span>
              <span
                className={cn(
                  'inline-flex',
                  'items-center',
                  'gap-0.5',
                  'rounded-full',
                  'bg-emerald-100',
                  'px-1.5',
                  'py-0.5',
                  'text-[8px]',
                  'font-bold',
                  'text-emerald-700',
                  'ml-1',
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('Online')}
              </span>
            </div>
            <ChevronRight
              className={cn('h-4', 'w-4', 'text-muted-dark', 'shrink-0')}
            />
          </Link>

          {/* Removed Green Member Banner */}
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Menu Items */}
        <div className="space-y-1">
          <Link to="/account" hash="personal">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              )}
            >
              <User className={cn('h-4', 'w-4', 'text-muted-foreground/85')} />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('My Profile')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('Manage your profile')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>

          <Link to="/account/bookings">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              )}
            >
              <Calendar
                className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
              />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('My Bookings')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('View your bookings')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>

          {session.user && (
            <Link to="/account/listings">
              <DropdownMenuItem
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                )}
              >
                <Percent
                  className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
                />
                <div>
                  <p
                    className={cn('text-sm', 'font-medium', 'text-foreground')}
                  >
                    {t('My Listings')}
                  </p>
                  <p className={cn('text-xs', 'text-muted-foreground/85')}>
                    {t('Manage your items')}
                  </p>
                </div>
              </DropdownMenuItem>
            </Link>
          )}

          {session.user && !isAdminRole(session.user.role) && hasListings && (
            <Link to="/dashboard">
              <DropdownMenuItem
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                )}
              >
                <LayoutDashboard
                  className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
                />
                <div>
                  <p
                    className={cn('text-sm', 'font-medium', 'text-foreground')}
                  >
                    {t('Dashboard')}
                  </p>
                  <p className={cn('text-xs', 'text-muted-foreground/85')}>
                    {t('View statistics')}
                  </p>
                </div>
              </DropdownMenuItem>
            </Link>
          )}

          {isAdminRole(session.user.role) && (
            <Link to="/admin/dashboard">
              <DropdownMenuItem
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                )}
              >
                <LayoutDashboard
                  className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
                />
                <div>
                  <p
                    className={cn('text-sm', 'font-medium', 'text-foreground')}
                  >
                    {t('Admin')}
                  </p>
                  <p className={cn('text-xs', 'text-muted-foreground/85')}>
                    {t('System management')}
                  </p>
                </div>
              </DropdownMenuItem>
            </Link>
          )}

          {hasListings && (
            <Link to="/account/reviews">
              <DropdownMenuItem
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                )}
              >
                <Star
                  className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
                />
                <div>
                  <p
                    className={cn('text-sm', 'font-medium', 'text-foreground')}
                  >
                    {t('Reviews')}
                  </p>
                  <p className={cn('text-xs', 'text-muted-foreground/85')}>
                    {t('Your feedback')}
                  </p>
                </div>
              </DropdownMenuItem>
            </Link>
          )}

          <Link to="/account/messages">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              )}
            >
              <MessageSquare
                className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
              />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('Messages')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('Conversations')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="space-y-1">
          <Link to="/help">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              )}
            >
              <HelpCircle
                className={cn('h-4', 'w-4', 'text-muted-foreground/85')}
              />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('Help & Support')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('Get assistance')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-destructive hover:text-destructive hover:bg-danger transition-colors',
          )}
          onClick={onSignOut}
        >
          <LogOut className={cn('h-4', 'w-4')} />
          <p className={cn('text-sm', 'font-medium')}>{t('Sign Out')}</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
