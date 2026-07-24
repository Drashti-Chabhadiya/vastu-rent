import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '#/components/ui/navigation-menu'
import { cn } from '#/lib/utils'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { ArrowUpRight, Sparkles } from 'lucide-react'

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Become a host', path: '/become-lister' },
]

interface NavDesktopMenuProps {
  categories: any[] | undefined
  t: (key: string) => string
}

export function NavDesktopMenu({ categories, t }: NavDesktopMenuProps) {
  return (
    <nav className={cn('hidden', 'items-center', 'lg:flex')}>
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                'bg-transparent',
                'hover:bg-muted-light',
                'data-[state=open]:bg-brand-green-tint',
                'data-[state=open]:text-primary',
                'text-sm',
                'font-semibold',
                'text-foreground/80',
                'transition-all',
                'rounded-full',
              )}
            >
              {t('Categories')}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid grid-cols-1 md:grid-cols-12 w-[500px] md:w-[700px] lg:w-[850px] overflow-hidden rounded-2xl bg-card border border-border/40 shadow-lift">
                {/* Left Panel */}
                <div className="md:col-span-4 p-6 bg-gradient-to-br from-primary-soft/40 to-primary-soft/10 dark:from-primary-soft/20 dark:to-background/20 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/40">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t('Vastu Catalog')}
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl font-medium tracking-tight text-brand-ink dark:text-foreground leading-tight">
                      {t('Find items for every aspect of life.')}
                    </h3>
                    <p className="text-xs text-muted-foreground/90 leading-relaxed">
                      {t(
                        'Browse carefully kept rental items from neighbors you trust. Good for your wallet, great for the planet.',
                      )}
                    </p>
                  </div>

                  <Link
                    to="/categories"
                    className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover group transition-colors"
                  >
                    <span>{t('Explore all categories')}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                {/* Right Panel */}
                <div className="md:col-span-8 p-4 flex flex-col">
                  <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                    {t('All Categories')}
                  </div>

                  {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[380px] overflow-y-auto pr-1">
                      {categories.map((category: any) => (
                        <NavigationMenuLink key={category.id} asChild>
                          <Link
                            to="/categories/$id"
                            params={{ id: category.id }}
                            className="flex items-center gap-3 select-none rounded-xl p-2.5 transition-all duration-200 hover:bg-primary-soft/40 dark:hover:bg-primary-soft/20 group hover:border-transparent border border-transparent"
                          >
                            <CategoryIcon
                              category={category}
                              size="md"
                              className="group-hover:scale-105 transition-transform shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {category.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground/85">
                                {category._count?.products || 0} {t('items')}
                              </span>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground/80">
                      {categories?.length === 0
                        ? t('No categories found')
                        : t('Loading categories...')}
                    </div>
                  )}
                </div>
              </div>
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
                {t(link.label)}
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}
