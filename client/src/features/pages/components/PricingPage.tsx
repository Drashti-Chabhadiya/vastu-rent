import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sprout,
  Home,
  Building2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Lock,
  Headphones,
} from 'lucide-react'
import { motion } from 'motion/react'
import { EASE, fadeUp, stagger } from '#/lib/animations'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Switch } from '#/components/ui/switch'
import { authClient } from '#/lib/auth/auth-client'
import { useSettings, useCreateCheckoutSession } from '#/hook'

export function PricingPage() {
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

  // Calculate pricing based on billing toggle (20% off for yearly)
  const getProPrice = () =>
    isYearly ? Math.round(rawProPrice * 0.8) : rawProPrice
  const getBusinessPrice = () =>
    isYearly ? Math.round(rawBusinessPrice * 0.8) : rawBusinessPrice

  const starterFeatures: string[] = settings?.pricing?.starterFeatures || [
    'List up to 5 items',
    'Basic item insights',
    'Standard support',
    'Secure payments',
  ]

  const proFeatures: string[] = settings?.pricing?.proFeatures || [
    'List up to 50 items',
    'Advanced item insights',
    'Priority support',
    'Secure payments',
    'Promoted listings',
  ]

  const businessFeatures: string[] = settings?.pricing?.businessFeatures || [
    'Unlimited listings',
    'Advanced analytics',
    'Priority support',
    'Secure payments',
    'Promoted listings',
    'Custom business profile',
  ]

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-[1400px] px-6 pt-12 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-brand-surface-warm rounded-[2.5rem] border border-border/20 shadow-sm">
          {/* Left Hero Details */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="md:col-span-7 flex flex-col justify-center px-8 py-16 sm:p-12 lg:p-16"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Pricing Plans
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-brand-ink"
            >
              Simple, transparent <br />
              <span className="italic text-primary">pricing.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Choose the perfect plan to rent your items and start earning with
              Vastu.
            </motion.p>
          </motion.div>

          {/* Right Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="md:col-span-5 relative min-h-[300px] md:min-h-full overflow-hidden"
          >
            <img
              src="/assets/contact-hero.png"
              alt="Beautiful Vastu Arched Room"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Billing Switch Toggle */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-[1400px] px-6 mt-16 md:px-10 flex justify-center"
      >
        <div className="flex items-center gap-4 bg-muted/30 p-2 px-5 rounded-full border border-border/40 shadow-sm">
          <span
            className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-brand-ink' : 'text-muted-foreground'}`}
          >
            Monthly billing
          </span>

          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />

          <span
            className={`text-sm font-semibold transition-colors ${isYearly ? 'text-brand-ink' : 'text-muted-foreground'}`}
          >
            Yearly billing
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            Save up to 20%
          </span>
        </div>
      </motion.section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-[1400px] px-6 mt-12 md:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {/* Starter Plan */}
          <motion.div variants={fadeUp} className="flex flex-col h-full">
            <Card className="border border-border/30 rounded-[2.5rem] bg-card p-8 lg:p-10 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 h-full">
              <CardContent className="p-0 flex flex-col h-full justify-between">
                <div>
                  {/* Header info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 shrink-0">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-ink text-lg">
                        Starter
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Perfect for getting started.
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-8">
                    <div className="flex items-baseline text-brand-ink">
                      <span className="text-4xl font-extrabold tracking-tight">
                        ₹{rawStarterPrice}
                      </span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      No setup fees. No hidden charges.
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectPlan('Starter')}
                    variant="outline"
                    className="w-full rounded-full border border-border py-6 text-sm font-bold text-brand-ink hover:bg-muted/10 active:scale-[0.98]"
                  >
                    Get Started
                  </Button>
                </div>

                {/* Separator */}
                <div className="my-8 border-t border-border/30" />

                {/* Features */}
                <ul className="space-y-4">
                  {starterFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="text-[13.5px] text-muted-foreground leading-relaxed">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan (MOST POPULAR) */}
          <motion.div variants={fadeUp} className="flex flex-col h-full">
            <Card className="relative border-2 border-primary rounded-[2.5rem] bg-card p-8 lg:p-10 shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full">
              {/* Most Popular Badge */}
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-sm">
                Most Popular
              </span>

              <CardContent className="p-0 flex flex-col h-full justify-between">
                <div>
                  {/* Header info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 shrink-0">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-ink text-lg">Pro</h3>
                      <p className="text-xs text-muted-foreground">
                        For growing renters.
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-8">
                    <div className="flex items-baseline text-brand-ink">
                      <span className="text-4xl font-extrabold tracking-tight">
                        ₹{getProPrice()}
                      </span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isYearly
                        ? `Billed annually as ₹${getProPrice() * 12} (Save ₹${(rawProPrice - getProPrice()) * 12})`
                        : `Billed monthly as ₹${rawProPrice}`}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectPlan('Pro')}
                    className="w-full rounded-full bg-primary py-6 text-sm font-bold text-primary-foreground hover:bg-primary/95 active:scale-[0.98]"
                  >
                    Choose Pro
                  </Button>
                </div>

                {/* Separator */}
                <div className="my-8 border-t border-border/30" />

                {/* Features */}
                <ul className="space-y-4">
                  {proFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="text-[13.5px] text-brand-ink font-medium leading-relaxed">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Business Plan */}
          <motion.div variants={fadeUp} className="flex flex-col h-full">
            <Card className="border border-border/30 rounded-[2.5rem] bg-card p-8 lg:p-10 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 h-full">
              <CardContent className="p-0 flex flex-col h-full justify-between">
                <div>
                  {/* Header info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-ink text-lg">
                        Business
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        For serious sellers & businesses.
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-8">
                    <div className="flex items-baseline text-brand-ink">
                      <span className="text-4xl font-extrabold tracking-tight">
                        ₹{getBusinessPrice()}
                      </span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isYearly
                        ? `Billed annually as ₹${getBusinessPrice() * 12} (Save ₹${(rawBusinessPrice - getBusinessPrice()) * 12})`
                        : `Billed monthly as ₹${rawBusinessPrice}`}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectPlan('Business')}
                    variant="outline"
                    className="w-full rounded-full border border-border py-6 text-sm font-bold text-brand-ink hover:bg-muted/10 active:scale-[0.98]"
                  >
                    Choose Business
                  </Button>
                </div>

                {/* Separator */}
                <div className="my-8 border-t border-border/30" />

                {/* Features */}
                <ul className="space-y-4">
                  {businessFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="text-[13.5px] text-muted-foreground leading-relaxed">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Panel Bottom */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-[1400px] px-6 mt-16 md:px-10"
      >
        <div className="bg-brand-surface-warm border border-border/20 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 border border-primary/10 shrink-0">
              <ShieldCheck className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-brand-ink text-lg">
                Trusted. Secure. Hassle-free.
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is protected and payments are 100% secure with Vastu.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-brand-ink text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-primary" />
              <span>Data Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4.5 w-4.5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
