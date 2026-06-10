import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Heart, Smartphone, User, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'How it works', path: '/', hash: 'how-it-works' },
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
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-card border-l border-border shadow-2xl flex flex-col justify-between pt-24 pb-8 px-6 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="space-y-6 overflow-y-auto max-h-[75vh] scrollbar-hide pr-1">
          {/* Quick Links */}
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
                    onClose()
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
                  {t(link.label)}
                </Link>
              ))}

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart
                    size={18}
                    className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                  />
                  <span>{t('Wishlist')}</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border border-card shadow-sm">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Download App Link */}
              <Link
                to="/download"
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Smartphone
                  size={18}
                  className="text-muted-foreground/80 group-hover:text-primary shrink-0"
                />
                <span>{t('Download App')}</span>
              </Link>
            </div>
          </div>

          {/* Categories Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">
              {t('Quick Navigation')}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              {categories?.slice(0, 6).map((category: any) => (
                <Link
                  key={category.id}
                  to="/categories/$id"
                  params={{ id: category.id }}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold text-foreground/75 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <span>{category.name}</span>
                  <ChevronRight size={14} className="opacity-45" />
                </Link>
              ))}
              {categories && categories.length > 6 && (
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
              <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center gap-2">
                <User size={14} /> {t('Sign In')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
