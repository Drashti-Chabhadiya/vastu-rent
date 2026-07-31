import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { useSessionContext, SESSION_QUERY_KEY } from '#/context/SessionContext'
import { queryClient } from '#/lib/query-client'
import { Logo } from '#/components/layout'
import { useCategories, useWishlist } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'
import { Link, useNavigate } from '@tanstack/react-router'
import { SearchDialog } from '#/components/common/SearchDialog'
import { Button } from '#/components/ui/button'
import {
  User,
  ArrowUpRight,
  Search,
  Smartphone,
  Heart,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { NavDesktopMenu } from './navbar/NavDesktopMenu'
import { NavUserDropdown } from './navbar/NavUserDropdown'
import { NavMobileMenu } from './navbar/NavMobileMenu'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from '@/components/ui/language-selector'

export function Navbar() {
  const { t } = useTranslation()
  const { data: session, isPending } = useSessionContext()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { count } = useWishlist()
  const { data: categories } = useCategories()

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
    await authClient.signOut()
    queryClient.setQueryData(SESSION_QUERY_KEY, null)
    queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
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
          'safe-area-top', // Pad below Android/iOS status bar (viewport-fit=cover)
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
          <NavDesktopMenu categories={categories} t={t} />

          {/* Right Side Actions */}
          <div className={cn('flex', 'items-center', 'gap-1.5', 'sm:gap-2')}>
            {/* Search Button - desktop */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="ghost"
              className={cn(
                'hidden lg:flex items-center gap-2 h-9 w-9 xl:w-auto rounded-full bg-muted/50 hover:bg-muted transition-all px-0 xl:px-4 justify-center border border-transparent hover:border-border',
                'text-muted-foreground/85 hover:text-foreground/80',
              )}
              aria-label={t('Search...')}
              title={t('Search...')}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium hidden xl:inline">
                {t('Search...')}
              </span>
              <kbd className="ml-1 pointer-events-none hidden xl:flex select-none items-center gap-0.5 rounded border border-border/120 bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground/85 opacity-100">
                ⌘K
              </kbd>
            </Button>

            {/* Search Button - mobile */}
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
            <Link to="/wishlist" className="relative group">
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

            {/* Language Selector (hidden on mobile, accessible in mobile drawer) */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Theme Toggle (hidden on mobile, accessible in mobile drawer) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

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
              <NavUserDropdown
                session={session}
                onSignOut={handleSignOut}
                t={t}
              />
            ) : (
              <>
                {/* Full Sign In button - sm and above */}
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
                    {t('Sign in')}
                    <ArrowUpRight className={cn('h-4', 'w-4')} />
                  </Button>
                </Link>

                {/* Icon-only Sign In - mobile */}
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
                    aria-label={t('Sign in')}
                    title={t('Sign in')}
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
      <NavMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        session={session}
        onSignOut={handleSignOut}
        categories={categories}
        wishlistCount={count}
        t={t}
      />

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
