import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sprout,
  Home,
  Building2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth/auth-client'
import { useSettings, useCreateCheckoutSession } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

export function PricingPage() {
  const { t, formatNumber } = useTranslation()
  const [isYearly, setIsYearly] = useState(false)
  const { data: session } = authClient.useSession()
  const { data: settings } = useSettings()
  const createCheckoutSession = useCreateCheckoutSession()

  const rawStarterPrice =
    settings?.pricing?.starterPrice !== undefined
      ? settings.pricing.starterPrice
      : 0
  const rawProPrice =
    settings?.pricing?.proPrice !== undefined ? settings.pricing.proPrice : 499
  const rawBusinessPrice =
    settings?.pricing?.businessPrice !== undefined
      ? settings.pricing.businessPrice
      : 999

  const getProPrice = () =>
    isYearly ? Math.round(rawProPrice * 0.8) : rawProPrice
  const getBusinessPrice = () =>
    isYearly ? Math.round(rawBusinessPrice * 0.8) : rawBusinessPrice

  const handleSelectPlan = async (planName: string) => {
    if (planName.toLowerCase() === 'starter') {
      toast.info('The Starter plan is free and active by default.')
      return
    }
    if (!session) {
      toast.error('Please sign in to upgrade your plan.')
      window.location.href = `/login?redirect=/pricing`
      return
    }
    const toastId = toast.loading(
      `Initiating checkout for the ${planName} plan...`,
    )
    try {
      const res = await createCheckoutSession.mutateAsync({
        planName,
        interval: isYearly ? 'yearly' : 'monthly',
      })
      if (res?.url) {
        toast.success('Redirecting to secure payment page...', { id: toastId })
        window.location.href = res.url
      } else {
        toast.error('Failed to create checkout session.', { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.response?.data?.message || 'Checkout failed. Please try again.',
        { id: toastId },
      )
    }
  }

  const starterFeatures: string[] = settings?.pricing?.starterFeatures || [
    'List up to 5 items',
    'Basic item insights',
    'Standard support',
    'Secure payments',
  ]
  const proFeatures: string[] = settings?.pricing?.proFeatures || [
    'List up to 50 items',
    'Priority support',
    'Advanced item insights',
    'Secure payments',
    'Promoted listings',
  ]
  const businessFeatures: string[] = settings?.pricing?.businessFeatures || [
    'Unlimited listings',
    'Custom business profile',
    'Advanced analytics',
    'Priority support',
    'Secure payments',
    'Promoted listings',
  ]

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Sprout,
      price: rawStarterPrice,
      perMonthNote: t('No setup fees. No hidden charges.'),
      tagline: t('Perfect for getting started.'),
      badge: null,
      features: starterFeatures,
      actionLabel: t('Get Started'),
      dark: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Home,
      price: getProPrice(),
      perMonthNote: isYearly
        ? `${t('Billed yearly as ₹')}${formatNumber(rawProPrice * 0.8 * 12)}`
        : `${t('Billed monthly as ₹')}${formatNumber(rawProPrice)}`,
      tagline: t('For growing renters.'),
      badge: t('MOST POPULAR'),
      features: proFeatures,
      actionLabel: t('Choose Pro'),
      dark: true,
    },
    {
      id: 'business',
      name: 'Business',
      icon: Building2,
      price: getBusinessPrice(),
      perMonthNote: isYearly
        ? `${t('Billed yearly as ₹')}${formatNumber(rawBusinessPrice * 0.8 * 12)}`
        : `${t('Billed monthly as ₹')}${formatNumber(rawBusinessPrice)}`,
      tagline: t('For serious sellers & businesses.'),
      badge: null,
      features: businessFeatures,
      actionLabel: t('Choose Business'),
      dark: false,
    },
  ]

  return (
    <div className="min-h-full bg-[#FBF9F4] dark:bg-background pb-28 lg:pb-20">
      {/* ── HERO (desktop only) ── */}
      {/* Mobile Top Header */}
      <div className="md:hidden px-4 pt-2">
        <MobileBackHeader title={t('Pricing')} />
      </div>

      <section className="hidden lg:block mx-auto max-w-[1400px] px-10 pt-12">
        <div className="grid grid-cols-12 overflow-hidden bg-brand-surface-warm rounded-[2.5rem] border border-border/20 shadow-sm">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="col-span-7 flex flex-col justify-center px-16 py-16"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('Pricing Plans')}
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-brand-ink"
            >
              {t('Simple, transparent pricing.')}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              {t(
                'Choose the perfect plan to rent your items and start earning with Vastu.',
              )}
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="col-span-5 relative min-h-[300px] overflow-hidden"
          >
            <img
              src="/assets/contact-hero.png"
              alt="Vastu Pricing"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* ── MOBILE HERO ── */}
      <section className="lg:hidden px-5 pt-6">
        <p className="text-[10px] font-extrabold tracking-[0.12em] text-primary uppercase mb-2">
          · {t('Pricing Plans')}
        </p>
        <h1 className="font-display text-[26px] font-medium leading-tight text-foreground tracking-tight">
          {t('Simple, transparent')}
          <br />
          {t('pricing.')}
        </h1>
        <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">
          {t('Choose a plan and start earning by lending what you own.')}
        </p>
      </section>

      {/* ── BILLING TOGGLE ── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex justify-center mt-6 lg:mt-12 px-5"
      >
        {/* Desktop Switch style */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-12">
          <span
            className={cn(
              'text-sm font-extrabold',
              !isYearly ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {t('Monthly billing')}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isYearly ? 'bg-primary' : 'bg-muted-dark/30',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                isYearly ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
          <span
            className={cn(
              'text-sm font-extrabold',
              isYearly ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {t('Yearly billing')}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            {t('Save up to 20%')}
          </span>
        </div>

        {/* Mobile Pill-buttons style */}
        <div className="flex lg:hidden bg-brand-beige/70 dark:bg-muted/30 rounded-full p-1 text-[11px] font-bold border border-border/30 shadow-xs">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer border-none',
              !isYearly
                ? 'bg-white dark:bg-card text-foreground shadow-xs'
                : 'text-muted-foreground',
            )}
          >
            {t('Monthly')}
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 border-none',
              isYearly
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground',
            )}
          >
            {t('Yearly')} · -20%
          </button>
        </div>
      </motion.section>

      {/* ── PLAN CARDS ── */}
      <section className="mx-auto max-w-[1200px] px-5 lg:px-10 mt-5 lg:mt-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-stretch"
        >
          {plans.map((plan) => {
            const Icon = plan.icon
            const isPro = plan.id === 'pro'
            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={cn(
                  'relative rounded-[20px] lg:rounded-[32px] border p-4 lg:p-8 flex flex-col bg-card shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300',
                  isPro
                    ? 'border-2 border-primary shadow-md scale-100 lg:scale-[1.02] z-10'
                    : 'border-border/25 hover:shadow-md',
                )}
              >
                {/* Most Popular badge */}
                {isPro && (
                  <span className="absolute -top-3 left-4 lg:left-1/2 lg:-translate-x-1/2 rounded-full bg-primary text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 lg:px-4.5 lg:py-1.5 shadow-sm whitespace-nowrap">
                    {t('MOST POPULAR')}
                  </span>
                )}

                {/* Header - Desktop (hidden on mobile) */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-soft/20 dark:bg-primary-soft/10 flex items-center justify-center shrink-0">
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-foreground leading-none">
                      {t(plan.name)}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-none">
                      {plan.tagline}
                    </p>
                  </div>
                </div>

                {/* Header - Mobile (hidden on desktop) */}
                <div
                  className={cn(
                    'lg:hidden flex items-center gap-2.5',
                    plan.badge && 'mt-1',
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className="text-primary shrink-0"
                  />
                  <h3 className="font-bold text-[13px] text-foreground leading-none">
                    {t(plan.name)}
                  </h3>
                </div>

                {/* Price */}
                <div className="mt-3 lg:mt-8 flex items-baseline gap-0.5">
                  <span className="font-display text-[26px] lg:text-5xl font-semibold lg:font-black text-foreground">
                    ₹{formatNumber(plan.price)}
                  </span>
                  <span className="text-[11px] lg:text-xs font-medium lg:font-semibold text-muted-foreground ml-1">
                    {t('/month')}
                  </span>
                </div>
                <p className="text-[10.5px] lg:text-[11px] font-bold text-muted-foreground mt-0.5 lg:mt-2">
                  {plan.perMonthNote}
                </p>

                {/* CTA Button */}
                {isPro ? (
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    className="mt-3.5 lg:mt-8 w-full bg-primary hover:bg-primary-hover text-white rounded-full font-black text-[12px] h-10 lg:h-12 shadow-md active:scale-[0.98] transition-all cursor-pointer border-none flex items-center justify-center"
                  >
                    {t(plan.actionLabel)}
                  </button>
                ) : (
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    variant="outline"
                    className="mt-3.5 lg:mt-8 w-full rounded-full border-primary text-primary hover:bg-primary-soft/15 font-black text-[12px] h-10 lg:h-12 shadow-none active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
                  >
                    {t(plan.actionLabel)}
                  </Button>
                )}

                {/* Feature list — desktop only */}
                <div className="hidden lg:block mt-10 pt-8 border-t border-border/15 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2
                          size={16}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <span className="text-xs lg:text-sm font-semibold text-muted-foreground leading-tight">
                          {t(f)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ── CTA STICKY BOTTOM (mobile only) ── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-3 bg-gradient-to-t from-[#FBF9F4] dark:from-background via-[#FBF9F4]/95 dark:via-background/95 to-transparent pointer-events-none">
        {session ? (
          <Link
            to="/account/listings"
            className="pointer-events-auto w-full flex items-center justify-center gap-2 bg-primary text-white rounded-full font-extrabold text-[13px] py-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            {t('List your first item')}
            <ChevronRight size={15} strokeWidth={2.5} />
          </Link>
        ) : (
          <Link
            to="/login"
            search={{ redirect: '/pricing' }}
            className="pointer-events-auto w-full flex items-center justify-center gap-2 bg-primary text-white rounded-full font-extrabold text-[13px] py-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            {t('List your first item')}
            <ChevronRight size={15} strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* ── TRUST PANEL (desktop only) ── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="hidden lg:block mx-auto max-w-[1400px] px-10 mt-16"
      >
        <div className="bg-brand-surface-warm border border-border/20 rounded-[2rem] p-8 flex items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="font-bold text-brand-ink text-lg">
              {t('Trusted. Secure. Hassle-free.')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                'Your data is protected and payments are 100% secure with Vastu.',
              )}
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary px-8 h-11 font-bold text-sm text-primary-foreground hover:bg-primary/95 shrink-0 cursor-pointer"
          >
            {session ? (
              <Link to="/account/listings">{t('Get Started Free')}</Link>
            ) : (
              <Link to="/login" search={{ redirect: '/pricing' }}>
                {t('Get Started Free')}
              </Link>
            )}
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
