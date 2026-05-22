import { Logo } from './Logo'
import { Button } from '#/components/ui/button'

export function Footer() {
  const cols = [
    {
      t: 'Browse',
      l: ['Catalogue', 'Categories', 'New this week', "Editor's picks"],
    },
    { t: 'Vastu', l: ['About', 'Journal', 'Sustainability', 'Press'] },
    { t: 'Hosts', l: ['Become a host', 'Host guide', 'Pricing', 'Insurance'] },
    { t: 'Help', l: ['FAQ', 'Contact', 'Trust & safety', 'Terms'] },
  ]
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              A neighborhood marketplace for the well-made and well-kept. Made
              slowly in Stockholm.
            </p>
            <form className="mt-8 flex max-w-sm items-center overflow-hidden rounded-full border border-border bg-card pr-1.5">
              <input
                type="email"
                placeholder="Your email for the monthly letter"
                className="flex-1 bg-transparent px-5 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button className="rounded-full bg-primary px-4 py-2.5 h-auto text-[12px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer">
                Subscribe
              </Button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {cols.map((c) => (
              <div key={c.t}>
                <div className="text-[11px] uppercase tracking-[0.2em] text-foreground">
                  {c.t}
                </div>
                <ul className="mt-5 space-y-3">
                  {c.l.map((i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-[13.5px] text-muted-foreground transition-colors hover:text-primary"
                      >
                        {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} Vastu — Rent Anything. Live in Harmony.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">
              Privacy
            </a>
            <a href="#" className="hover:text-primary">
              Cookies
            </a>
            <a href="#" className="hover:text-primary">
              Imprint
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
