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

const navLinks = [
  { label: 'Catalogue', path: '/', hash: 'categories' },
  { label: 'How it works', path: '/', hash: 'how-it-works' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Journal', path: '/', hash: 'journal' },
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
                'data-[state=open]:bg-muted-light',
                'text-sm',
                'font-semibold',
                'text-foreground/80',
                'transition-colors',
              )}
            >
              {t('Categories')}
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
                          {t('Explore items in')} {category.name}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
                {!categories?.length && (
                  <div
                    className={cn('p-4', 'text-sm', 'text-muted-foreground/85')}
                  >
                    {t('Loading categories...')}
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
                {t(link.label)}
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}
