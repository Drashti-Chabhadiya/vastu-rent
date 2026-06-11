import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronRight,
  ChevronDown,
  Leaf,
  Calendar,
  Percent,
  Star,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { isAdminRole } from '#/lib/auth/roles'

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
          <div
            className={cn(
              'relative',
              'h-9',
              'w-9',
              'rounded-full',
              'border-2',
              'border-border',
            )}
          >
            <Avatar className={cn('h-full', 'w-full')}>
              <AvatarImage
                src={session.user.image || ''}
                alt={session.user.name}
              />
              <AvatarFallback
                className={cn(
                  'bg-primary/10',
                  'text-sm',
                  'font-bold',
                  'text-primary',
                )}
              >
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute',
                '-bottom-0.5',
                '-right-0.5',
                'h-3',
                'w-3',
                'rounded-full',
                'bg-primary',
                'border-2',
                'border-card',
                'shadow-sm',
              )}
            >
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          </div>
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
            <Avatar className={cn('h-12', 'w-12', 'border', 'border-border')}>
              <AvatarImage
                src={session.user.image || ''}
                alt={session.user.name}
              />
              <AvatarFallback
                className={cn(
                  'bg-primary/10',
                  'text-sm',
                  'font-bold',
                  'text-primary',
                )}
              >
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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

          {/* Green Member Banner */}
          {session.user.isGreenMember ? (
            <div
              className={cn(
                'rounded-xl',
                'bg-linear-to-r',
                'from-green-50',
                'to-emerald-50',
                'p-3',
                'border',
                'border-primary-border',
              )}
            >
              <div className={cn('flex', 'items-center', 'gap-2.5')}>
                <div
                  className={cn(
                    'flex',
                    'h-8',
                    'w-8',
                    'shrink-0',
                    'items-center',
                    'justify-center',
                    'rounded-full',
                    'bg-primary-soft/80',
                    'text-primary-hover',
                  )}
                >
                  <Leaf className={cn('h-4', 'w-4')} />
                </div>
                <div className="flex-1">
                  <p className={cn('text-xs', 'font-bold', 'text-green-900')}>
                    {t('Green Member')}
                  </p>
                  <p className={cn('text-[11px]', 'text-primary-hover')}>
                    {t("You're saving the planet!")} 🌍
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'rounded-xl',
                'bg-muted-light/50',
                'p-3.5',
                'border',
                'border-border/60',
              )}
            >
              <div className="space-y-2.5">
                <div className={cn('flex', 'items-center', 'gap-2')}>
                  <div
                    className={cn(
                      'flex',
                      'h-6',
                      'w-6',
                      'shrink-0',
                      'items-center',
                      'justify-center',
                      'rounded-full',
                      'bg-muted-dark/20',
                      'text-muted-foreground',
                    )}
                  >
                    <Leaf className={cn('h-3.5', 'w-3.5')} />
                  </div>
                  <p className={cn('text-xs', 'font-bold', 'text-foreground/90')}>
                    {t('Become a Green Member')}
                  </p>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {t('List items and verify your details to earn the green badge and stand out!')}
                </p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 border-t border-border/40 text-[9px] font-bold text-muted-dark">
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      session.user.emailVerified ? "bg-emerald-500" : "bg-muted-dark/30"
                    )} />
                    <span className={session.user.emailVerified ? "text-foreground/70" : ""}>
                      {t('Email Verified')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      session.user.phone ? "bg-emerald-500" : "bg-muted-dark/30"
                    )} />
                    <span className={session.user.phone ? "text-foreground/70" : ""}>
                      {t('Phone Added')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      session.user.location ? "bg-emerald-500" : "bg-muted-dark/30"
                    )} />
                    <span className={session.user.location ? "text-foreground/70" : ""}>
                      {t('Location Added')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-dark/30" />
                    <span>{t('1+ Active Listings')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Menu Items */}
        <div className="space-y-1">
          <Link to="/account">
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

          {session.user && !isAdminRole(session.user.role) && (
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

          <Link to="/wishlist">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors sm:hidden',
              )}
            >
              <Heart className={cn('h-4', 'w-4', 'text-muted-foreground/85')} />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('Wishlist')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('Saved items')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>

          <Link to="/account/reviews">
            <DropdownMenuItem
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              )}
            >
              <Star className={cn('h-4', 'w-4', 'text-muted-foreground/85')} />
              <div>
                <p className={cn('text-sm', 'font-medium', 'text-foreground')}>
                  {t('Reviews')}
                </p>
                <p className={cn('text-xs', 'text-muted-foreground/85')}>
                  {t('Your feedback')}
                </p>
              </div>
            </DropdownMenuItem>
          </Link>

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
