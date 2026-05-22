import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { Logo } from '#/components/layout'
import { useCategories, useWishlist } from '#/hook'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  const navigate = useNavigate()

  const { count } = useWishlist()
  const { data: categories } = useCategories()

  useEffect(() => {
    authClient.getSession().then((res: any) => {
      setSession(res.data)
      setIsPending(false)
    })
  }, [])

  const handleSignOut = async () => {
    setIsPending(true)
    await authClient.signOut()
    setSession(null)
    setIsPending(false)
    navigate({ to: '/' })
  }
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 md:px-10">
        <Link to="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <nav className="hidden items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories?.map((category: any) => (
                      <li key={category.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/categories/$id"
                            params={{ id: category.id }}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              {category.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Explore items in {category.name}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                    {!categories?.length && (
                      <div className="p-4 text-sm text-muted-foreground">
                        No categories found
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
                      'bg-transparent hover:bg-transparent focus:bg-transparent',
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Search"
            className="h-10 w-10 rounded-full border border-border text-foreground/70 transition-all hover:bg-accent hover:text-foreground active:scale-95 cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Link to="/download">
            <Button
              variant="outline"
              size="icon"
              aria-label="Download App"
              className="h-10 w-10 rounded-full border border-border text-foreground/70 transition-all hover:bg-accent hover:text-foreground active:scale-95 cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/wishlist">
            <Button
              variant="outline"
              size="icon"
              aria-label="Saved"
              className="group relative h-10 w-10 rounded-full border border-border text-foreground/70 transition-all hover:bg-accent hover:text-foreground active:scale-95 cursor-pointer"
            >
              <Heart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>
          {isPending ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-accent/50" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border p-0 outline-none transition-all hover:ring-4 hover:ring-primary/10 hover:bg-transparent active:scale-95 cursor-pointer">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={session.user.image || ''}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="bg-primary/5 text-[13px] font-medium text-primary">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[340px] p-3 rounded-[24px] bg-card border border-border shadow-lift" align="end" sideOffset={8}>
                <div className="flex flex-col gap-1.5 p-1">
                  {/* User Profile Header */}
                  <Link
                    to="/account"
                    className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-muted/55 focus:bg-accent/40 cursor-pointer"
                  >
                    <Avatar className="h-12 w-12 border border-border/60">
                      <AvatarImage
                        src={session.user.image || ''}
                        alt={session.user.name}
                      />
                      <AvatarFallback className="bg-primary/5 text-base font-bold text-primary">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground text-[14px] leading-none truncate">
                          {session.user.name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/60 px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                          <svg
                            className="h-2.5 w-2.5 text-primary shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {session.user.email}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  </Link>

                  {/* Green Member Banner */}
                  <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-accent/30 p-3 border border-accent/20">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/80 text-primary">
                        <Leaf className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-accent-foreground leading-tight">
                          Green Member
                        </span>
                        <span className="text-[9px] text-muted-foreground/80 leading-none mt-0.5">
                          You're saving the planet!
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/about"
                      className="text-[10px] font-bold text-accent-foreground underline hover:text-primary transition-colors shrink-0"
                    >
                      View Impact
                    </Link>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/60" />

                <div className="flex flex-col gap-0.5">
                  {/* My Profile */}
                  <Link to="/account">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          My Profile
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          View and edit your profile
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  {/* My Bookings */}
                  <Link to="/account/bookings">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          My Bookings
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Check your upcoming and past bookings
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  {/* My Listings / Become Host */}
                  {session.user.role === 'owner' ||
                  session.user.role === 'admin' ||
                  session.user.role === 'superAdmin' ? (
                    <Link to="/profile/listings">
                      <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                        <Percent className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground leading-snug">
                            My Listings
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Manage your listed items
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  ) : (
                    <Link to="/become-lister">
                      <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                        <Percent className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground leading-snug">
                            Become a Host
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Earn income renting your items
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {/* Owner Dashboard */}
                  {(session.user.role === 'owner' ||
                    session.user.role === 'admin' ||
                    session.user.role === 'superAdmin') && (
                    <Link to="/owner/dashboard">
                      <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                        <LayoutDashboard className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground leading-snug">
                            Owner Dashboard
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Manage bookings and listings performance
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {/* Admin Dashboard */}
                  {(session.user.role === 'admin' ||
                    session.user.role === 'superAdmin') && (
                    <Link to="/admin/dashboard">
                      <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                        <LayoutDashboard className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground leading-snug">
                            Admin Dashboard
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            System overview and administration
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {/* Wishlist */}
                  <Link to="/wishlist">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <Heart className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          Wishlist
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Items you love
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  {/* Reviews */}
                  <Link to="/account/reviews">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <Star className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          Reviews
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Reviews you've given and received
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  {/* Messages / Notifications */}
                  <Link to="/account/notifications">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          Messages
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Chat with hosts and members
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/60" />

                <div className="flex flex-col gap-0.5">
                  {/* Settings */}
                  <Link to="/account/profile">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <Settings className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          Settings
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Account, privacy and preferences
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  {/* Help & Support */}
                  <Link to="/help">
                    <DropdownMenuItem className="flex items-start gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors focus:bg-accent/40">
                      <HelpCircle className="mt-0.5 h-4 w-4 text-muted-foreground/70 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          Help & Support
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Get help and view FAQs
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/60" />

                {/* Log Out */}
                <DropdownMenuItem
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-xs font-bold text-destructive">
                    Log out
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 h-auto text-[13px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 sm:inline-flex cursor-pointer">
                Sign in
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
