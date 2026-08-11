import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import {
  ShieldCheck,
  Leaf,
  CreditCard,
  ArrowRight,
  Star,
  Search,
  Sparkles,
  Bell,
  Heart,
} from 'lucide-react'
import heroImg from '../../../../public/assets/hero-living.jpg'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { useNavigate, Link } from '@tanstack/react-router'
import { useProducts, useWishlist, useNotifications } from '#/hook'
import { HeroSkeleton } from '#/components/skeletons'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useSessionContext } from '#/context/SessionContext'
import { UserAvatar } from '#/components/common/UserAvatar'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '#/lib/utils'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function HeroSection() {
  const { t, formatDigits, formatCurrency } = useTranslation()
  const { data: session } = useSessionContext()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { data: products, isPending } = useProducts({
    status: 'active',
    isFeatured: true,
  })
  const { count: wishlistCount } = useWishlist()
  const { data: notifications = [] } = useNotifications()
  const unreadNotificationsCount = notifications.filter(
    (n: any) => !n.isRead,
  ).length

  const featuredProduct = products?.find(
    (p: any) => p.images && p.images.length > 0,
  )
  const displayImg = featuredProduct ? featuredProduct.images[0] : heroImg
  const displayTitle = featuredProduct
    ? featuredProduct.title
    : 'Mira Lounge Chair'
  const displayPrice = featuredProduct ? featuredProduct.price : 1250
  const displayRating = featuredProduct?.rating || '4.96'
  const displayHost = featuredProduct?.user?.name || 'Drashti'
  const displayCategory = featuredProduct?.category?.name || 'Living'
  const displayLocation = featuredProduct?.city || 'Surat'

  const [emblaMobileRef, emblaMobileApi] = useEmblaCarousel({ loop: true })
  const [emblaDesktopRef, emblaDesktopApi] = useEmblaCarousel({ loop: true })
  const [selectedMobileIndex, setSelectedMobileIndex] = useState(0)
  const [selectedDesktopIndex, setSelectedDesktopIndex] = useState(0)

  useEffect(() => {
    if (!emblaMobileApi) return
    const onSelect = () => {
      setSelectedMobileIndex(emblaMobileApi.selectedScrollSnap())
    }
    emblaMobileApi.on('select', onSelect)
    const interval = setInterval(() => {
      emblaMobileApi.scrollNext()
    }, 4500)
    return () => {
      clearInterval(interval)
      emblaMobileApi.off('select', onSelect)
    }
  }, [emblaMobileApi])

  useEffect(() => {
    if (!emblaDesktopApi) return
    const onSelect = () => {
      setSelectedDesktopIndex(emblaDesktopApi.selectedScrollSnap())
    }
    emblaDesktopApi.on('select', onSelect)
    const interval = setInterval(() => {
      emblaDesktopApi.scrollNext()
    }, 4500)
    return () => {
      clearInterval(interval)
      emblaDesktopApi.off('select', onSelect)
    }
  }, [emblaDesktopApi])

  const banners =
    products && products.length > 0
      ? products
          .filter((p: any) => p.images && p.images.length > 0)
          .slice(0, 6)
          .map((p: any) => ({
            id: p.id,
            tag: t('Featured product'),
            title: p.title || p.name,
            subtitle: `${p.category?.name || t('Rent')} · ${p.city || p.location || 'Surat'}`,
            image: p.images[0],
            link: `/products/${p.id}`,
            price: p.price,
            rating: p.rating || '4.96',
            host: p.user?.name || 'Drashti',
            category: p.category?.name || 'Living',
            location: p.city || 'Surat',
          }))
      : [
          {
            id: 'featured-default',
            tag: t('Featured this week'),
            title: displayTitle,
            subtitle: `${displayCategory} · ${displayLocation}`,
            image: displayImg,
            link: featuredProduct
              ? `/products/${featuredProduct.id}`
              : '/products',
            price: displayPrice,
            rating: displayRating,
            host: displayHost,
            category: displayCategory,
            location: displayLocation,
          },
        ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({ to: '/products', search: { search: searchQuery } as any })
    } else {
      navigate({ to: '/products' })
    }
  }

  const heroSubtitle =
    t(
      'A quietly curated marketplace for the things you need, only when you need them. Quality lent between neighbors — gentler on your home, kinder to the planet.',
    ) ||
    'A quietly curated marketplace for the things you need, only when you need them. Quality lent between neighbors — gentler on your home, kinder to the planet.'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <section className="relative overflow-hidden bg-background pt-3 md:pt-6 lg:pt-10">
      {/* Mobile Welcome Header */}
      <div className="flex md:hidden items-center justify-between px-6 pt-3 pb-4 bg-background">
        <div>
          <span className="text-[10px] text-muted-foreground font-bold tracking-wide uppercase">
            {t(getGreeting())}
          </span>
          <h2 className="font-display text-base font-black text-foreground mt-0.5 leading-tight">
            {session?.user?.name || t('Guest')}
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector className="bg-brand-surface-warm border-border/40" />
          <Link
            to="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface-warm border border-border/40 text-foreground transition-all hover:bg-muted-light active:scale-95 shadow-xs"
          >
            <Heart size={16} strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-600 text-[7.5px] font-black text-white border-2 border-brand-surface-warm">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/account/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface-warm border border-border/40 text-foreground transition-all hover:bg-muted-light active:scale-95 shadow-xs"
          >
            <Bell size={16} strokeWidth={2} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-600 border border-brand-surface-warm" />
            )}
          </Link>
          <Link to="/account">
            <UserAvatar
              image={session?.user?.image}
              name={session?.user?.name || 'Guest'}
              size="trigger"
              avatarClassName="shadow-xs h-9 w-9"
            />
          </Link>
        </div>
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/3 left-10 -z-10 h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Desktop Layout */}
      <div className="hidden md:grid mx-auto max-w-[1400px] grid-cols-1 gap-10 px-6 pb-16 pt-4 md:px-10 lg:grid-cols-12 lg:gap-14 lg:pb-20">
        {/* Left column */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center lg:col-span-6 lg:py-6"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t('Issue 04 · Spring Catalogue')}
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-[clamp(2.25rem,4.5vw,4.25rem)] leading-[1.05] tracking-[-0.03em] text-foreground font-extrabold"
          >
            <span className="block">{t('Rent anything.')}</span>
            <span className="italic text-primary block mt-1 sm:whitespace-nowrap">
              {t('Live in harmony.')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-[15px] sm:text-[16.5px] leading-relaxed text-muted-foreground"
          >
            {heroSubtitle}
          </motion.p>

          {/* Quick Search Bar */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSearch}
            className="mt-7 flex w-full max-w-lg items-center rounded-2xl border border-border/50 bg-card p-2 shadow-soft transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  t('Search listings...') ||
                  'Search for camera, tools, furniture...'
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 text-sm shrink-0 shadow-sm"
            >
              {t('Search') || 'Search'}
            </Button>
          </motion.form>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-primary py-3.5 pl-6 pr-3 text-[14px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift"
            >
              {t('Explore the catalogue')}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="text-[14px] font-semibold text-foreground/80 underline decoration-border decoration-2 underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
            >
              {t('How it works')}
            </a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={fadeUp}
            className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-border/40 pt-6"
          >
            {[
              { k: formatDigits('5,000+'), v: t('Active members') },
              { k: formatDigits('10,000+'), v: t('Items in rotation') },
              { k: formatDigits('25k kg'), v: t('CO₂ saved') },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground">
                  {s.k}
                </div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column — editorial image showcase slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative lg:col-span-6 flex items-center justify-center"
        >
          {isPending ? (
            <HeroSkeleton />
          ) : (
            <div className="relative w-full max-w-[540px] overflow-hidden rounded-[2.5rem] bg-card border border-border/30 shadow-2xl">
              <div
                className="overflow-hidden rounded-[2.5rem]"
                ref={emblaDesktopRef}
              >
                <div className="flex">
                  {banners.map((b: any) => (
                    <div
                      key={b.id}
                      className="relative flex-[0_0_100%] min-w-0"
                    >
                      <img
                        src={b.image}
                        alt={b.title}
                        className="aspect-[4/5] h-full w-full object-cover"
                      />
                      {/* Bottom floating product details */}
                      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-4 backdrop-blur-md border border-border/40 shadow-lg">
                        <div className="flex-1 overflow-hidden pr-2 text-left">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground truncate">
                            {b.category} · {b.location}
                          </div>
                          <div className="mt-0.5 font-bold text-base text-foreground truncate">
                            {b.title}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/90 font-medium truncate">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />{' '}
                            {formatDigits(b.rating)} · {t('Hosted by')} {b.host}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-extrabold text-lg text-primary">
                            {formatCurrency(b.price)}
                            <span className="text-xs font-normal text-muted-foreground">
                              /day
                            </span>
                          </div>
                          <Link
                            to={b.link}
                            className="mt-1 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-primary hover:underline"
                          >
                            {t('Reserve') || 'Reserve'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliding Dots Indicators for Desktop */}
              <div className="absolute top-5 right-5 z-30 flex gap-1 bg-black/45 backdrop-blur-xs py-1.5 px-3 rounded-full">
                {banners.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => emblaDesktopApi?.scrollTo(index)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer',
                      index === selectedDesktopIndex
                        ? 'w-3.5 bg-white'
                        : 'w-1.5 bg-white/40',
                    )}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-4 px-6 pb-6 pt-2">
        {/* Compact Mobile Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex w-full items-center rounded-2xl border border-border/40 bg-card p-1 shadow-sm transition-all focus-within:border-primary"
        >
          <div className="relative flex-1 flex items-center pl-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search listings…')}
              className="w-full bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-3 py-1.5 text-xs shrink-0 shadow-xs h-8 border-none cursor-pointer"
          >
            {t('Search')}
          </Button>
        </form>

        {/* Mobile Promo Slider */}
        {isPending ? (
          <div className="h-[180px] rounded-[1.5rem] bg-muted animate-pulse" />
        ) : (
          <div className="relative">
            <div
              className="overflow-hidden rounded-[1.5rem] border border-border/30 shadow-lg"
              ref={emblaMobileRef}
            >
              <div className="flex">
                {banners.map((b: any) => (
                  <div
                    key={b.id}
                    className="relative flex-[0_0_100%] min-w-0 h-[180px]"
                  >
                    <Link to={b.link} className="absolute inset-0 z-20" />
                    <img
                      src={b.image}
                      alt={b.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Bottom floating details */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-30 flex items-end justify-between text-white">
                      <div className="overflow-hidden pr-2">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider opacity-85">
                          {b.subtitle}
                        </span>
                        <h3 className="font-display font-black text-sm truncate mt-0.5">
                          {b.title}
                        </h3>
                      </div>
                      {b.price && (
                        <div className="text-right shrink-0">
                          <span className="font-black text-sm">
                            {formatCurrency(b.price)}
                            <small className="text-[8.5px] font-normal opacity-85">
                              /day
                            </small>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sliding Dots Indicators */}
            <div className="absolute bottom-3 right-3 z-30 flex gap-1 bg-black/45 backdrop-blur-xs py-1 px-2 rounded-full">
              {banners.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => emblaMobileApi?.scrollTo(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer',
                    index === selectedMobileIndex
                      ? 'w-3.5 bg-white'
                      : 'w-1.5 bg-white/40',
                  )}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trust strip */}
      <div className="border-y border-border/40 bg-card/40 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-muted-foreground/85 md:px-10">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />{' '}
            {t('Verified hosts')}
          </span>
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />{' '}
            {t('Secure payments')}
          </span>
          <span className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" /> {t('Circular by design')}
          </span>
          <span className="hidden items-center gap-2 md:flex">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />{' '}
            {t('4.9 average rating')}
          </span>
        </div>
      </div>
    </section>
  )
}
