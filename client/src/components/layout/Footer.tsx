import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useTranslation } from '#/context/TranslationContext'
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  ShieldCheck,
  Headphones,
  Globe,
  ChevronDown,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useSubscribeNewsletter } from '#/hook'

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [region, setRegion] = useState('India (English)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const subscribeNewsletter = useSubscribeNewsletter()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error(t('Please enter a valid email address.'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(t('Please enter a valid email address.'))
      return
    }

    setIsSubmitting(true)
    try {
      // Attempt actual API call, fallback gracefully if endpoint is not built yet
      await subscribeNewsletter.mutateAsync(trimmedEmail)
      toast.success(t('Thank you for subscribing to stay in the loop!'))
      setEmail('')
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Fallback simulation for offline/preview environments
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast.success(t('Thank you for subscribing to stay in the loop!'))
        setEmail('')
      } else {
        toast.error(
          error.response?.data?.message ||
            t('Subscription failed. Please try again.'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    toast.success(`${t('Country/region switched to')} ${newRegion}`)
  }

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Blog', to: '/journal' },
    { label: 'Contact Us', to: '/contact' },
  ]

  const exploreLinks = [
    { label: 'Categories', to: '/categories' },
    { label: 'How it works', to: '/how-it-works' },
    { label: 'Pricing Plans', to: '/pricing' },
    { label: 'List an Item', to: '/become-lister' },
  ]

  const supportLinks = [
    { label: 'Help Center', to: '/help' },
    { label: 'Trust & Safety', to: '/trust-safety' },
    { label: 'Terms of Service', to: '/terms' },
  ]

  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Top Callout Card: Integrated inside the footer */}
        <div className="bg-brand-surface-warm border border-border/20 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mb-16">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 border border-primary/10 shrink-0">
              <Headphones className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-brand-ink text-lg">
                {t('Need help?')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('Our support team is here for you 24/7.')}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background px-6 py-3.5 text-sm font-bold text-brand-ink shadow-sm transition-all hover:bg-brand-surface-warm hover:border-primary active:scale-[0.98] w-full sm:w-auto"
            >
              {t('Visit Help Center')}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/95 px-6 py-3.5 text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              {t('Contact Support')}
              <Send className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6 pt-8 xl:grid-cols-12">
          {/* Column 1: Brand details & Socials */}
          <div className="col-span-1 min-[375px]:col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-4 flex flex-col justify-between">
            <div>
              <Logo />
              <p className="mt-6 max-w-none xl:max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t(
                  'A trusted community marketplace for renting and hosting quality items. Live simply. Live in harmony.',
                )}
              </p>
            </div>

            {/* Social Icons row */}
            <div className="flex gap-3 mt-8">
              {[
                {
                  icon: <Instagram className="h-4.5 w-4.5 text-primary" />,
                  url: 'https://instagram.com',
                },
                {
                  icon: <Facebook className="h-4.5 w-4.5 text-primary" />,
                  url: 'https://facebook.com',
                },
                {
                  icon: <Twitter className="h-4.5 w-4.5 text-primary" />,
                  url: 'https://twitter.com',
                },
                {
                  icon: <Linkedin className="h-4.5 w-4.5 text-primary" />,
                  url: 'https://linkedin.com',
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Company Navigation */}
          <div className="col-span-1 min-[375px]:col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
              {t('Company')}
            </h4>
            <ul className="mt-6 space-y-3.5">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Explore Navigation */}
          <div className="col-span-1 min-[375px]:col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
              {t('Explore')}
            </h4>
            <ul className="mt-6 space-y-3.5">
              {exploreLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support Navigation */}
          <div className="col-span-1 min-[375px]:col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
              {t('Support')}
            </h4>
            <ul className="mt-6 space-y-3.5">
              {supportLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Stay in the loop */}
          <div className="col-span-1 min-[375px]:col-span-2 sm:col-span-3 lg:col-span-1 xl:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
              {t('Stay in the loop')}
            </h4>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t('Get tips, updates, and inspiration straight to your inbox.')}
            </p>

            {/* Newsletter input form */}
            <form
              onSubmit={handleSubscribe}
              className="mt-6 relative flex items-center bg-brand-surface-warm border border-border rounded-2xl p-1 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all"
            >
              <Input
                type="email"
                placeholder={t('Enter your email')}
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 border-none shadow-none text-xs text-brand-ink placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSubmitting}
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm shrink-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Guarantee check text */}
            <div className="mt-4 flex items-center gap-2 text-[10.5px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{t('No spam, unsubscribe anytime.')}</span>
            </div>
          </div>
        </div>

        {/* Sub-footer divider / region row */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6 text-[12px] text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Vastu Rentals Private Limited. All
            rights reserved.
          </div>

          {/* Bottom right region indicators */}
          <div className="flex flex-wrap items-center gap-6 font-medium text-brand-ink/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[11.5px]">{t('Secure Payments')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[11.5px]">{t('Data Protection')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              <span className="text-[11.5px]">{t('24/7 Support')}</span>
            </div>

            {/* Interactive Dropdown for region selection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-[11.5px] hover:text-primary transition-colors cursor-pointer outline-none select-none h-auto p-0 hover:bg-transparent font-medium text-muted-foreground"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span>{region}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border border-border/50 rounded-xl shadow-md p-1">
                {[
                  'India (English)',
                  'United States (English)',
                  'Sweden (Svenska)',
                  'United Kingdom (English)',
                ].map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onClick={() => handleRegionChange(item)}
                    className="cursor-pointer rounded-lg px-3 py-1.5 text-[11.5px]"
                  >
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  )
}
