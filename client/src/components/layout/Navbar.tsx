import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole } from '#/lib/auth/roles'
import { Logo } from '#/components/layout'
import { useCategories, useWishlist } from '#/hook'
import { Link, useNavigate } from '@tanstack/react-router'
import { SearchDialog } from '#/components/common/SearchDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '#/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Heart,
  ArrowUpRight,
  Search,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Leaf,
  Calendar,
  Percent,
  Star,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '#/lib/utils'

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'How it works', path: '/', hash: 'how-it-works' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Journal', path: '/', hash: 'journal' },
  { label: 'Become a host', path: '/become-lister' },
]

export function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [isPending, setIsPending] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { count } = useWishlist()
  const { data: categories } = useCategories()

  useEffect(() => {
    authClient.getSession().then((res: any) => {
      setSession(res.data)
      setIsPending(false)
    })
  }, [])

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    setIsPending(true)
    await authClient.signOut()
    setSession(null)
    setIsPending(false)
    navigate({ to: '/' })
  }
  return (
    <>
      <header
        className={cn(
          'sticky',
          'top-0',
          'z-40',
          'border-b',
          'border-border/30/50',
          'bg-card/80',
          'backdrop-blur-lg',
          'supports-backdrop-filter:bg-card/60',
        )}
      >
        <div
          className={cn(
            'mx-auto',
            'flex',
            'h-20',
            'max-w-[1400px]',
            'items-center',
            'justify-between',
            'gap-4',
            'px-4',
            'sm:px-6',
            'lg:px-8',
          )}
        >
          {/* Logo */}
          <Link
            to="/"
            className={cn('shrink-0', 'transition-opacity', 'hover:opacity-80')}
          >
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn('hidden', 'items-center', 'lg:flex')}>
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'bg-transparent',
                      'hover:bg-muted-light',
                      'data-[state=open]:bg-muted-light',
                      'text-sm',
                      'font-semibold',
                      'text-foreground/80',
                      'transition-colors',
                    )}
                  >
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul
                      className={cn(
                        'grid',
                        'w-[400px]',
                        'gap-2',
                        'p-4',
                        'md:w-[500px]',
                        'md:grid-cols-2',
                        'lg:w-[600px]',
                      )}
                    >
                      {categories?.map((category: any) => (
                        <li key={category.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/categories/$id"
                              params={{ id: category.id }}
                              className={cn(
                                'block',
                                'select-none',
                                'space-y-1',
                                'rounded-lg',
                                'p-3',
                                'leading-none',
                                'no-underline',
                                'outline-none',
                                'transition-all',
                                'hover:bg-primary/5',
                                'hover:text-primary',
                                'focus:bg-primary/5',
                                'focus:text-primary',
                              )}
                            >
                              <div
                                className={cn(
                                  'text-sm',
                                  'font-semibold',
                                  'leading-none',
                                  'text-foreground',
                                )}
                              >
                                {category.name}
                              </div>
                              <p
                                className={cn(
                                  'line-clamp-2',
                                  'text-sm',
                                  'leading-snug',
                                  'text-muted-foreground/85',
                                )}
                              >
                                Explore items in {category.name}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      {!categories?.length && (
                        <div
                          className={cn(
                            'p-4',
                            'text-sm',
                            'text-muted-foreground/85',
                          )}
                        >
                          Loading categories...
                        </div>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.label}>
                    <Link
                      to={link.path as any}
                      hash={link.hash}
                      onClick={(e) => {
                        if (link.hash && window.location.pathname === '/') {
                          const el = document.getElementById(link.hash)
                          if (el) {
                            e.preventDefault()
                            el.scrollIntoView({ behavior: 'smooth' })
                          }
                        }
                      }}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent hover:bg-muted-light focus:bg-muted-light text-sm font-semibold text-foreground/80 transition-colors',
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right Side Actions */}
          <div className={cn('flex', 'items-center', 'gap-1.5', 'sm:gap-2')}>
            {/* Search Button */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="ghost"
              className={cn(
                'hidden lg:flex items-center gap-2 h-9 w-9 xl:w-auto rounded-full bg-muted/50 hover:bg-muted transition-all px-0 xl:px-4 justify-center border border-transparent hover:border-border',
                'text-muted-foreground/85 hover:text-foreground/80',
              )}
              aria-label="Search (⌘K)"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium hidden xl:inline">
                Search...
              </span>
              <kbd className="ml-1 pointer-events-none hidden xl:flex select-none items-center gap-0.5 rounded border border-border/120 bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground/85 opacity-100">
                ⌘K
              </kbd>
            </Button>
            {/* Mobile search icon */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="ghost"
              size="icon"
              className={cn(
                'flex lg:hidden h-10 w-10 rounded-full text-muted-foreground',
                'hover:bg-muted/50 hover:text-foreground transition-all active:scale-95',
              )}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Download App Button */}
            <Link to="/download" className={cn('hidden', 'sm:block')}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10',
                  'w-10',
                  'rounded-full',
                  'text-muted-foreground',
                  'hover:bg-muted/50',
                  'hover:text-foreground',
                  'transition-all',
                  'active:scale-95',
                )}
                aria-label="Download App"
              >
                <Smartphone className={cn('h-5', 'w-5')} />
              </Button>
            </Link>

            {/* Wishlist Button */}
            <Link to="/wishlist" className={cn('hidden', 'sm:block')}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'group',
                  'relative',
                  'h-10',
                  'w-10',
                  'rounded-full',
                  'text-muted-foreground',
                  'hover:bg-muted/50',
                  'hover:text-foreground',
                  'transition-all',
                  'active:scale-95',
                )}
                aria-label="Wishlist"
              >
                <Heart className={cn('h-5', 'w-5')} />
                {count > 0 && (
                  <span
                    className={cn(
                      'absolute',
                      '-right-1.5',
                      '-top-1.5',
                      'flex',
                      'h-5',
                      'w-5',
                      'items-center',
                      'justify-center',
                      'rounded-full',
                      'bg-primary',
                      'text-[10px]',
                      'font-bold',
                      'text-primary-foreground',
                      'shadow-lg',
                      'border',
                      'border-card',
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isPending ? (
              <div
                className={cn(
                  'h-10',
                  'w-10',
                  'animate-pulse',
                  'rounded-full',
                  'bg-muted',
                )}
              />
            ) : session?.user ? (
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
                      <Avatar
                        className={cn(
                          'h-12',
                          'w-12',
                          'border',
                          'border-border',
                        )}
                      >
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
                          className={cn(
                            'flex',
                            'items-center',
                            'gap-1.5',
                            'flex-wrap',
                          )}
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
                          Verified
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
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4',
                          'w-4',
                          'text-muted-dark',
                          'shrink-0',
                        )}
                      />
                    </Link>

                    {/* Green Member Banner */}
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
                          <p
                            className={cn(
                              'text-xs',
                              'font-bold',
                              'text-green-900',
                            )}
                          >
                            Green Member
                          </p>
                          <p
                            className={cn('text-[11px]', 'text-primary-hover')}
                          >
                            You're saving the planet! 🌍
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link to="/account">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <User
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            My Profile
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Manage your profile
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/account/bookings">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <Calendar
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            My Bookings
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            View your bookings
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    {session.user && (
                      <Link to="/account/listings">
                        <DropdownMenuItem
                          className={cn(
                            'flex',
                            'items-center',
                            'gap-3',
                            'px-3',
                            'py-2',
                            'rounded-lg',
                            'cursor-pointer',
                            'transition-colors',
                          )}
                        >
                          <Percent
                            className={cn(
                              'h-4',
                              'w-4',
                              'text-muted-foreground/85',
                            )}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-foreground',
                              )}
                            >
                              My Listings
                            </p>
                            <p
                              className={cn(
                                'text-xs',
                                'text-muted-foreground/85',
                              )}
                            >
                              Manage your items
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {session.user && (
                      <Link to="/owner/dashboard">
                        <DropdownMenuItem
                          className={cn(
                            'flex',
                            'items-center',
                            'gap-3',
                            'px-3',
                            'py-2',
                            'rounded-lg',
                            'cursor-pointer',
                            'transition-colors',
                          )}
                        >
                          <LayoutDashboard
                            className={cn(
                              'h-4',
                              'w-4',
                              'text-muted-foreground/85',
                            )}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-foreground',
                              )}
                            >
                              Dashboard
                            </p>
                            <p
                              className={cn(
                                'text-xs',
                                'text-muted-foreground/85',
                              )}
                            >
                              View statistics
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {isAdminRole(session.user.role) && (
                      <Link to="/admin/dashboard">
                        <DropdownMenuItem
                          className={cn(
                            'flex',
                            'items-center',
                            'gap-3',
                            'px-3',
                            'py-2',
                            'rounded-lg',
                            'cursor-pointer',
                            'transition-colors',
                          )}
                        >
                          <LayoutDashboard
                            className={cn(
                              'h-4',
                              'w-4',
                              'text-muted-foreground/85',
                            )}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-foreground',
                              )}
                            >
                              Admin
                            </p>
                            <p
                              className={cn(
                                'text-xs',
                                'text-muted-foreground/85',
                              )}
                            >
                              System management
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    <Link to="/wishlist">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                          'sm:hidden',
                        )}
                      >
                        <Heart
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            Wishlist
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Saved items
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/account/reviews">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <Star
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            Reviews
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Your feedback
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/account/messages">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <MessageSquare
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            Messages
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Conversations
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  </div>

                  <DropdownMenuSeparator className="my-2" />

                  <div className="space-y-1">
                    <Link to="/account/profile">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <Settings
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            Settings
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Preferences
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/help">
                      <DropdownMenuItem
                        className={cn(
                          'flex',
                          'items-center',
                          'gap-3',
                          'px-3',
                          'py-2',
                          'rounded-lg',
                          'cursor-pointer',
                          'transition-colors',
                        )}
                      >
                        <HelpCircle
                          className={cn(
                            'h-4',
                            'w-4',
                            'text-muted-foreground/85',
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-foreground',
                            )}
                          >
                            Help & Support
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              'text-muted-foreground/85',
                            )}
                          >
                            Get assistance
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  </div>

                  <DropdownMenuSeparator className="my-2" />

                  <DropdownMenuItem
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-3',
                      'px-3',
                      'py-2',
                      'rounded-lg',
                      'cursor-pointer',
                      'text-destructive',
                      'hover:text-destructive',
                      'hover:bg-danger',
                      'transition-colors',
                    )}
                    onClick={handleSignOut}
                  >
                    <LogOut className={cn('h-4', 'w-4')} />
                    <p className={cn('text-sm', 'font-medium')}>Sign Out</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Full Sign In button — visible on sm and above */}
                <Link to="/login" className={cn('hidden', 'sm:block')}>
                  <Button
                    className={cn(
                      'gap-2',
                      'rounded-full',
                      'bg-primary',
                      'px-6',
                      'py-2.5',
                      'h-auto',
                      'text-sm',
                      'font-semibold',
                      'text-primary-foreground',
                      'transition-all',
                      'hover:bg-primary-hover',
                      'active:scale-95',
                    )}
                  >
                    Sign in
                    <ArrowUpRight className={cn('h-4', 'w-4')} />
                  </Button>
                </Link>

                {/* Compact icon-only Sign In button — visible only on mobile (< sm) */}
                <Link to="/login" className={cn('sm:hidden')}>
                  <Button
                    size="icon"
                    className={cn(
                      'h-10',
                      'w-10',
                      'rounded-full',
                      'bg-primary',
                      'text-primary-foreground',
                      'hover:bg-primary-hover',
                      'active:scale-95',
                      'transition-all',
                    )}
                    aria-label="Sign in"
                    title="Sign in"
                  >
                    <User className={cn('h-5', 'w-5')} />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="flex lg:hidden h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all active:scale-95 z-50 relative"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-all duration-300 ease-in-out',
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        {/* Backdrop blur */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-card border-l border-border shadow-2xl flex flex-col justify-between pt-24 pb-8 px-6 transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="space-y-6 overflow-y-auto max-h-[75vh] scrollbar-hide pr-1">
            {/* Quick Links Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">
                Quick Navigation
              </h4>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path as any}
                    hash={link.hash}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false)
                      if (link.hash && window.location.pathname === '/') {
                        const el = document.getElementById(link.hash)
                        if (el) {
                          e.preventDefault()
                          el.scrollIntoView({ behavior: 'smooth' })
                        }
                      }
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Wishlist Link inside Drawer */}
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart
                      size={18}
                      className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                    />
                    <span>Wishlist</span>
                  </div>
                  {count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border border-card shadow-sm">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </Link>

                {/* Smartphone App Link inside Drawer */}
                <Link
                  to="/download"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Smartphone
                    size={18}
                    className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                  />
                  <span>Download App</span>
                </Link>
              </div>
            </div>

            {/* Collapsible/Direct Categories Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">
                Categories
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {categories?.slice(0, 6).map((category: any) => (
                  <Link
                    key={category.id}
                    to="/categories/$id"
                    params={{ id: category.id }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold text-foreground/75 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <span>{category.name}</span>
                    <ChevronRight size={14} className="opacity-45" />
                  </Link>
                ))}
                {categories && categories.length > 6 && (
                  <Link
                    to="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[11px] font-bold text-primary hover:underline px-3 pt-1 block"
                  >
                    View all categories
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions Area */}
          <div className="border-t border-border/50 pt-6 space-y-4">
            {session?.user ? (
              <div className="space-y-3">
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted-light transition-colors"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage
                      src={session.user.image || ''}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-xs truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </Link>

                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  variant="outline"
                  className="w-full h-10 rounded-xl border-border text-destructive hover:bg-danger/20 hover:text-destructive font-bold text-xs gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center gap-2">
                  <User size={14} /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
