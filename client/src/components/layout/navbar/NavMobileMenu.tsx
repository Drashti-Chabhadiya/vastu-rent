import { Link } from '@tanstack/react-router'
import { UserAvatar } from '#/components/common/UserAvatar'
import { Button } from '#/components/ui/button'
import { LanguageSelector } from '@/components/ui/language-selector'
import {
  Heart,
  Smartphone,
  User,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Calendar,
  Percent,
  Settings,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { useTheme } from '#/hook'

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Journal', path: '/', hash: 'journal' },
  { label: 'Become a host', path: '/become-lister' },
]

interface NavMobileMenuProps {
  isOpen: boolean
  onClose: () => void
  session: any
  onSignOut: () => void
  categories: any[] | undefined
  wishlistCount: number
  t: (key: string) => string
}

export function NavMobileMenu({
  isOpen,
  onClose,
  session,
  onSignOut,
  categories,
  wishlistCount,
  t,
}: NavMobileMenuProps) {
  const { theme, setTheme } = useTheme()
  return (
    <div
      className={cn(
        'fixed inset-0 z-30 lg:hidden transition-all duration-300 ease-in-out',
        isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-card border-l border-border shadow-2xl flex flex-col justify-between pt-20 pb-6 px-5 sm:px-6 transition-transform duration-300 ease-out z-40',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="space-y-6 overflow-y-auto max-h-[78vh] scrollbar-none pr-1">
          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
              {t('Quick Navigation')}
            </h4>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path as any}
                  hash={link.hash}
                  onClick={(e) => {
                    onClose()
                    if (link.hash && window.location.pathname === '/') {
                      const el = document.getElementById(link.hash)
                      if (el) {
                        e.preventDefault()
                        el.scrollIntoView({ behavior: 'smooth' })
                      }
                    }
                  }}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {t(link.label)}
                </Link>
              ))}

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart
                    size={16}
                    className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                  />
                  <span>{t('Wishlist')}</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground border border-card shadow-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Download App Link */}
              <Link
                to="/download"
                onClick={onClose}
                className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Smartphone
                  size={16}
                  className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                />
                <span>{t('Download App')}</span>
              </Link>
            </div>
          </div>

          {/* User Account Quick Links if logged in */}
          {session?.user && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
                {t('My Account')}
              </h4>
              <div className="flex flex-col gap-0.5">
                <Link
                  to="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <User
                    size={16}
                    className="text-muted-foreground/80 shrink-0"
                  />
                  <span>{t('My Profile')}</span>
                </Link>
                <Link
                  to="/account/bookings"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Calendar
                    size={16}
                    className="text-muted-foreground/80 shrink-0"
                  />
                  <span>{t('My Bookings')}</span>
                </Link>
                <Link
                  to="/account/listings"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Percent
                    size={16}
                    className="text-muted-foreground/80 shrink-0"
                  />
                  <span>{t('My Listings')}</span>
                </Link>
                <Link
                  to="/account/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Settings
                    size={16}
                    className="text-muted-foreground/80 shrink-0"
                  />
                  <span>{t('Settings')}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
              {t('Categories')}
            </h4>
            <div className="grid grid-cols-1 gap-0.5">
              {categories?.slice(0, 5).map((category: any) => (
                <Link
                  key={category.id}
                  to="/categories/$id"
                  params={{ id: category.id }}
                  onClick={onClose}
                  className="flex items-center justify-between py-1.5 px-3 rounded-xl text-xs font-bold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <span>{category.name}</span>
                  <ChevronRight size={14} className="opacity-45" />
                </Link>
              ))}
              {categories && categories.length > 5 && (
                <Link
                  to="/categories"
                  onClick={onClose}
                  className="text-[11px] font-bold text-primary hover:underline px-3 pt-1 block"
                >
                  {t('View all categories')}
                </Link>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
              {t('Language')}
            </h4>
            <LanguageSelector className="w-full justify-between h-9 px-3 rounded-xl border border-border/40 bg-card font-bold text-xs shadow-none" />
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
              {t('Theme & Appearance')}
            </h4>
            <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-border/30">
              <Button
                variant="ghost"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 h-auto rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none shadow-none',
                  theme === 'light'
                    ? 'bg-card text-primary border border-border/40 hover:bg-card hover:text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                <Sun
                  size={14}
                  className={
                    theme === 'light' ? 'text-primary' : 'text-muted-foreground'
                  }
                />
                <span>{t('Light')}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 h-auto rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none shadow-none',
                  theme === 'dark'
                    ? 'bg-card text-primary border border-border/40 hover:bg-card hover:text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                <Moon
                  size={14}
                  className={
                    theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
                  }
                />
                <span>{t('Dark')}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme('auto')}
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 h-auto rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none shadow-none',
                  theme === 'auto'
                    ? 'bg-card text-primary border border-border/40 hover:bg-card hover:text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                <Laptop
                  size={14}
                  className={
                    theme === 'auto' ? 'text-primary' : 'text-muted-foreground'
                  }
                />
                <span>{t('System')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-border/50 pt-6 space-y-4">
          {session?.user ? (
            <div className="space-y-3">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted-light transition-colors"
              >
                <UserAvatar
                  image={session.user.image}
                  name={session.user.name}
                  size="trigger"
                  avatarClassName="border border-border"
                />
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
                  onClose()
                  onSignOut()
                }}
                variant="outline"
                className="w-full h-10 rounded-xl border-border text-destructive hover:bg-danger/20 hover:text-destructive font-bold text-xs gap-2"
              >
                <LogOut size={14} /> {t('Sign Out')}
              </Button>
            </div>
          ) : (
            <Link to="/login" onClick={onClose} className="block">
              <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2">
                <User size={14} /> {t('Sign In')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
