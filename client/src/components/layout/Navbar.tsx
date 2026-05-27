import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
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
} from 'lucide-react'
import { cn } from '#/lib/utils'

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'How it works', path: '/', hash: 'how-it-works' },
  { label: 'Journal', path: '/', hash: 'journal' },
  { label: 'Become a host', path: '/become-lister' },
]

export function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [isPending, setIsPending] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
          'border-slate-100/50',
          'bg-white/80',
          'backdrop-blur-lg',
          'supports-backdrop-filter:bg-white/60',
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
                      'hover:bg-slate-50',
                      'data-[state=open]:bg-slate-50',
                      'text-sm',
                      'font-semibold',
                      'text-slate-700',
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
                                  'text-slate-900',
                                )}
                              >
                                {category.name}
                              </div>
                              <p
                                className={cn(
                                  'line-clamp-2',
                                  'text-sm',
                                  'leading-snug',
                                  'text-slate-500',
                                )}
                              >
                                Explore items in {category.name}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      {!categories?.length && (
                        <div className={cn('p-4', 'text-sm', 'text-slate-500')}>
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
                        'bg-transparent hover:bg-slate-50 focus:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors',
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
                'hidden lg:flex items-center gap-2 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all px-4',
                'text-slate-500 hover:text-slate-700 border border-transparent hover:border-slate-200',
              )}
              aria-label="Search (⌘K)"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Search...</span>
              <kbd className="ml-1 pointer-events-none hidden select-none items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-500 opacity-100 sm:flex">
                ⌘K
              </kbd>
            </Button>
            {/* Mobile search icon */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="ghost"
              size="icon"
              className={cn(
                'flex lg:hidden h-10 w-10 rounded-full text-slate-600',
                'hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95',
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
                  'text-slate-600',
                  'hover:bg-slate-100',
                  'hover:text-slate-900',
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
                  'text-slate-600',
                  'hover:bg-slate-100',
                  'hover:text-slate-900',
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
                      'text-white',
                      'shadow-lg',
                      'border',
                      'border-white',
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
                  'bg-slate-200',
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
                      'hover:bg-slate-100',
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
                        'border-slate-200',
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
                          'bg-green-500',
                          'border-2',
                          'border-white',
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
                        'text-slate-400',
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
                    'bg-white',
                    'border',
                    'border-slate-200',
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
                        'hover:bg-slate-50',
                      )}
                    >
                      <Avatar
                        className={cn(
                          'h-12',
                          'w-12',
                          'border',
                          'border-slate-200',
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
                              'text-slate-900',
                              'text-sm',
                              'truncate',
                            )}
                          >
                            {session.user.name}
                          </span>
                          <p
                            className={cn(
                              'text-xs',
                              'text-slate-500',
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
                            'bg-green-100',
                            'px-1.5',
                            'py-0.5',
                            'text-[8px]',
                            'font-bold',
                            'text-green-700',
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
                          'text-slate-400',
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
                        'border-green-100',
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
                            'bg-green-100',
                            'text-green-700',
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
                          <p className={cn('text-[11px]', 'text-green-700')}>
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
                        <User className={cn('h-4', 'w-4', 'text-slate-500')} />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            My Profile
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                          className={cn('h-4', 'w-4', 'text-slate-500')}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            My Bookings
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
                            View your bookings
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    {(session.user.role === 'owner' ||
                      session.user.role === 'admin' ||
                      session.user.role === 'superAdmin') && (
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
                            className={cn('h-4', 'w-4', 'text-slate-500')}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-slate-900',
                              )}
                            >
                              My Listings
                            </p>
                            <p className={cn('text-xs', 'text-slate-500')}>
                              Manage your items
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {(session.user.role === 'owner' ||
                      session.user.role === 'admin' ||
                      session.user.role === 'superAdmin') && (
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
                            className={cn('h-4', 'w-4', 'text-slate-500')}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-slate-900',
                              )}
                            >
                              Dashboard
                            </p>
                            <p className={cn('text-xs', 'text-slate-500')}>
                              View statistics
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {(session.user.role === 'admin' ||
                      session.user.role === 'superAdmin') && (
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
                            className={cn('h-4', 'w-4', 'text-slate-500')}
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                'font-medium',
                                'text-slate-900',
                              )}
                            >
                              Admin
                            </p>
                            <p className={cn('text-xs', 'text-slate-500')}>
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
                        <Heart className={cn('h-4', 'w-4', 'text-slate-500')} />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            Wishlist
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                        <Star className={cn('h-4', 'w-4', 'text-slate-500')} />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            Reviews
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                          className={cn('h-4', 'w-4', 'text-slate-500')}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            Messages
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                          className={cn('h-4', 'w-4', 'text-slate-500')}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            Settings
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                          className={cn('h-4', 'w-4', 'text-slate-500')}
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              'font-medium',
                              'text-slate-900',
                            )}
                          >
                            Help & Support
                          </p>
                          <p className={cn('text-xs', 'text-slate-500')}>
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
                      'text-red-600',
                      'hover:text-red-700',
                      'hover:bg-red-50',
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
                    'text-white',
                    'transition-all',
                    'hover:bg-primary/90',
                    'active:scale-95',
                  )}
                >
                  Sign in
                  <ArrowUpRight className={cn('h-4', 'w-4')} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
