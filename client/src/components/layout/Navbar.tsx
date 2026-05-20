import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { Logo } from "#/components/layout";
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
} from "#/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "#/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { User, LogOut, LayoutDashboard, Settings, Heart, ArrowUpRight, Search, Smartphone } from "lucide-react"
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
                            <div className="text-sm font-medium leading-none">{category.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Explore items in {category.name}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                    {!categories?.length && (
                      <div className="p-4 text-sm text-muted-foreground">No categories found</div>
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
                        const el = document.getElementById(link.hash);
                        if (el) {
                          e.preventDefault();
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-transparent focus:bg-transparent"
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
          <button
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link to="/download">
            <button
              aria-label="Download App"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </Link>
          <Link to="/account/wishlist">
            <button
              aria-label="Saved"
              className="group relative grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          </Link>
          {isPending ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-accent/50" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full border border-border outline-none transition-all hover:ring-4 hover:ring-primary/10">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name} />
                    <AvatarFallback className="bg-primary/5 text-[13px] font-medium text-primary">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link to="/account">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Summary</span>
                    </DropdownMenuItem>
                  </Link>
                  {(session.user.role === 'owner' || session.user.role === 'admin' || session.user.role === 'superAdmin') && (
                    <Link to="/owner/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Owner Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {(session.user.role === 'admin' || session.user.role === 'superAdmin') && (
                    <Link to="/admin/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link to="/account/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5" 
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <button className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all hover:bg-primary/90 sm:inline-flex">
                Sign in
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
