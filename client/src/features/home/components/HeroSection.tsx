import { useState } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ShieldCheck, Leaf, CreditCard, ArrowRight, Star, Search, Sparkles } from 'lucide-react'
import heroImg from '../../../../public/assets/hero-living.jpg'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { useNavigate, Link } from '@tanstack/react-router'

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
  const { t, formatDigits } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <section className="relative overflow-hidden bg-background pt-6 lg:pt-10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/3 left-10 -z-10 h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 pb-16 pt-4 md:px-10 lg:grid-cols-12 lg:gap-14 lg:pb-20">
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
            <span className="italic text-primary block mt-1 whitespace-nowrap">
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
                placeholder={t('Search listings...') || 'Search for camera, tools, furniture...'}
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

        {/* Right column — editorial image showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative lg:col-span-6 flex items-center justify-center"
        >
          <div className="relative w-full max-w-[540px] overflow-hidden rounded-[2.5rem] bg-card border border-border/30 shadow-2xl">
            <img
              src={heroImg}
              alt="Scandinavian aesthetic armchair"
              className="aspect-[4/5] h-full w-full object-cover"
            />
            {/* Top featured tag */}
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground backdrop-blur-md border border-border/40 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('Featured · The Linen Armchair')}
            </div>

            {/* Bottom floating product details */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-4 backdrop-blur-md border border-border/40 shadow-lg">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Living · Stockholm
                </div>
                <div className="mt-0.5 font-bold text-base text-foreground">
                  Mira Lounge Chair
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/90 font-medium">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{' '}
                  {formatDigits('4.96')} · Hosted by Anneli
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-lg text-primary">
                  {formatDigits('₹1,250')}
                  <span className="text-xs font-normal text-muted-foreground">/day</span>
                </div>
                <Link
                  to="/products"
                  className="mt-1 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-primary hover:underline"
                >
                  {t('Reserve') || 'Reserve'}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
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
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {t('4.9 average rating')}
          </span>
        </div>
      </div>
    </section>
  )
}
