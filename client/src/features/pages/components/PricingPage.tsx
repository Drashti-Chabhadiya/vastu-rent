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
      perMonthNote: 'No setup fees.',
      tagline: 'Perfect for getting started.',
      badge: null,
      features: starterFeatures,
      actionLabel: 'Get started',
      actionVariant: 'outline' as const,
      dark: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Home,
      price: getProPrice(),
      perMonthNote: `List up to 50 items · Priority support`,
      tagline: 'For growing renters.',
      badge: 'MOST POPULAR',
      features: proFeatures,
      actionLabel: 'Choose Pro',
      actionVariant: 'primary' as const,
      dark: true,
    },
    {
      id: 'business',
      name: 'Business',
      icon: Building2,
      price: getBusinessPrice(),
      perMonthNote: `Unlimited listings · Custom profile`,
      tagline: 'For serious sellers & businesses.',
      badge: null,
      features: businessFeatures,
      actionLabel: 'Choose Business',
      actionVariant: 'outline' as const,
      dark: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-background pb-28 lg:pb-20">
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
        <div className="inline-flex bg-brand-beige/70 dark:bg-muted/30 rounded-full p-1 text-[11px] font-bold border border-border/30 shadow-xs">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer',
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
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5',
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
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 mt-5 lg:mt-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-stretch"
        >
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={cn(
                  'relative rounded-[20px] lg:rounded-[2.5rem] border p-4 lg:p-10',
                  plan.dark
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card border-border/25 shadow-xs lg:shadow-sm',
                  !plan.dark &&
                    'hover:shadow-md transition-shadow duration-300',
                )}
              >
                {/* Most Popular badge */}
                {plan.badge && (
                  <span className="absolute -top-3 left-4 rounded-full bg-[#c97a45] text-white text-[9px] font-extrabold tracking-[0.06em] uppercase px-3 py-1 shadow-sm">
                    {plan.badge}
                  </span>
                )}

                {/* Header */}
                <div
                  className={cn(
                    'flex items-center gap-2.5',
                    plan.badge && 'mt-1',
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={plan.dark ? 'text-white/80' : 'text-primary'}
                  />
                  <h3
                    className={cn(
                      'font-bold text-[13px]',
                      plan.dark ? 'text-white' : 'text-foreground',
                    )}
                  >
                    {t(plan.name)}
                  </h3>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-0.5">
                  <span
                    className={cn(
                      'font-display text-[26px] lg:text-[36px] font-semibold',
                      plan.dark ? 'text-white' : 'text-foreground',
                    )}
                  >
                    ₹{formatNumber(plan.price)}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-medium ml-0.5',
                      plan.dark ? 'text-white/60' : 'text-muted-foreground',
                    )}
                  >
                    {t('/month')}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-[10.5px] mt-0.5',
                    plan.dark ? 'text-white/60' : 'text-muted-foreground',
                  )}
                >
                  {plan.perMonthNote}
                </p>

                {/* CTA Button */}
                {plan.dark ? (
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    className="mt-3.5 w-full bg-white text-primary rounded-full font-extrabold text-[12px] py-3 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {t(plan.actionLabel)}
                  </button>
                ) : (
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    variant="outline"
                    className="mt-3.5 w-full rounded-full border-border text-foreground font-bold text-[12px] h-10 lg:h-12 hover:bg-muted/10 active:scale-[0.98] cursor-pointer"
                  >
                    {t(plan.actionLabel)}
                  </Button>
                )}

                {/* Feature list — desktop only */}
                <div className="hidden lg:block mt-8 pt-6 border-t border-border/25">
                  <ul className="space-y-3.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={15}
                          className={
                            plan.dark
                              ? 'text-white/60 shrink-0'
                              : 'text-primary shrink-0'
                          }
                        />
                        <span
                          className={cn(
                            'text-[13px] leading-relaxed',
                            plan.dark
                              ? 'text-white/80'
                              : 'text-muted-foreground',
                          )}
                        >
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
