import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '#/components/ui/collapsible'
import { motion } from 'motion/react'
import { EASE, fadeUp, stagger } from '#/lib/animations'
import { useSettings } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

interface PrivacyNavSection {
  id: string
  label: string
  collapsedOnly: boolean
}

export function PrivacyPage() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('intro')
  const { data: settings } = useSettings()

  const lastUpdated = settings?.privacy?.lastUpdated || '28 May 2026'

  const dynamicSections = settings?.privacy?.sections || [
    {
      id: 'intro',
      title: 'Introduction',
      content:
        'Welcome to our Privacy Policy. This policy explains how we collect, use, and protect your personal information when you use Vastu-Rent. We are committed to ensuring your privacy and data security.',
    },
    {
      id: 'collection',
      title: 'Information We Collect',
      content:
        'We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you register for an account or rent an item. We also automatically collect certain device and usage data when you access our platform.',
    },
    {
      id: 'usage',
      title: 'How We Use Information',
      content:
        'We use your information to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about your account. We may also use data for analytics and personalization to enhance your experience.',
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      content:
        'We do not sell your personal information. We may share information with trusted third-party service providers (like payment processors) necessary to operate our platform. We may also share information if required by law or to protect our rights.',
    },
    {
      id: 'security',
      title: 'Data Security',
      content:
        'We implement robust security measures to protect your personal data from unauthorized access, alteration, or disclosure. However, no internet transmission is completely secure, and we cannot guarantee absolute security.',
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      content:
        'We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve your user experience. You can instruct your browser to refuse all cookies, but some features may not function properly.',
    },
    {
      id: 'rights',
      title: 'Your Rights',
      content:
        'You have the right to access, update, or delete your personal information. You can manage your preferences in your account settings or contact us for assistance regarding your data rights.',
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      content:
        'We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content:
        'If you have any questions about this Privacy Policy, please contact us through our Support page or email us directly at privacy@vasturent.com.',
    },
  ]

  const sections: PrivacyNavSection[] = dynamicSections.map(
    (sec: any, idx: number) => ({
      id: sec.id,
      label: sec.title,
      collapsedOnly: idx >= 5,
    }),
  )

  const mainSections = dynamicSections.slice(0, 5)
  const collapsedSections = dynamicSections.slice(5)

  const handleScrollTo = (id: string, collapsedOnly = false) => {
    if (collapsedOnly && !isOpen) {
      setIsOpen(true)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveSection(id)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen, sections])

  return (
    <div className="min-h-full bg-background pb-20">
      {/* Mobile Back Header */}
      <div className="md:hidden px-4 pt-2">
        <MobileBackHeader title={t('Privacy Policy')} />
      </div>

      {/* Hero Section Container */}
      <section className="mx-auto max-w-[1400px] px-0 sm:px-6 pt-0 md:pt-12 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-brand-surface-warm rounded-[2.5rem] border border-border/20 shadow-sm">
          {/* Left Hero Details */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="md:col-span-7 flex flex-col justify-center px-6 pt-6 pb-10 sm:p-12 lg:p-16 relative"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('Privacy Policy')}
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-brand-ink"
            >
              {t('Your privacy.')} <br />
              <span className="italic text-primary">{t('Our priority.')}</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {t('This Privacy Policy explains how we collect and use data.')}{' '}
              <br />
              {t('Your security and privacy matter to us.')}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <span className="inline-flex rounded-full bg-primary px-5 py-3 text-[13px] font-bold text-primary-foreground">
                {t('Last updated:')} {lastUpdated}
              </span>
            </motion.div>
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

      {/* Main content grid */}
      <section className="mx-auto max-w-[1400px] px-6 mt-16 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Sticky Left Sidebar Navigation */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="sticky top-[100px] space-y-6">
              <Card className="border border-border/30 rounded-[2rem] bg-card p-6 shadow-sm">
                <CardContent className="p-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-4">
                    {t('On this page')}
                  </span>
                  <nav className="flex flex-col gap-1">
                    {sections.map((sec) => {
                      const isActive = activeSection === sec.id
                      const isCollapsed = sec.collapsedOnly && !isOpen
                      return (
                        <Button
                          variant="ghost"
                          key={sec.id}
                          onClick={() =>
                            handleScrollTo(sec.id, sec.collapsedOnly)
                          }
                          className={`text-left text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-start relative h-auto w-full ${
                            isActive
                              ? 'text-primary bg-primary/5 pl-4 font-bold hover:bg-primary/5 hover:text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full" />
                          )}
                          <span
                            className={
                              isCollapsed ? 'opacity-40 line-through' : ''
                            }
                          >
                            {sec.label}
                          </span>
                        </Button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>

              {/* Sidebar helper callout */}
              <Card className="border border-border/30 rounded-[2rem] bg-primary/5 p-6 shadow-sm border-brand/5">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-primary/10 shrink-0 shadow-sm">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-ink text-sm">
                      {t('Questions about privacy?')}
                    </h4>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {t("We're here to help.")}
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group"
                  >
                    {t('Contact Support')}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-9 space-y-12 pr-0 lg:pr-6"
          >
            {mainSections.map((sec: any) => (
              <motion.div
                variants={fadeUp}
                key={sec.id}
                id={sec.id}
                className="scroll-mt-28 border-b border-border/30 pb-10"
              >
                <h2 className="text-xl font-bold text-brand-ink tracking-tight">
                  {sec.title}
                </h2>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {sec.content.split('\n').map((para: string, i: number) => (
                    <p key={i} className="mt-4">
                      {para}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Shadcn Collapsible Section for remaining items */}
            {collapsedSections.length > 0 && (
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="space-y-12"
              >
                <CollapsibleContent className="space-y-12 data-[state=open]:animate-slide-down">
                  {collapsedSections.map((sec: any) => (
                    <motion.div
                      variants={fadeUp}
                      key={sec.id}
                      id={sec.id}
                      className="scroll-mt-28 border-b border-border/30 pb-10"
                    >
                      <h2 className="text-xl font-bold text-brand-ink tracking-tight">
                        {sec.title}
                      </h2>
                      <div className="text-sm leading-relaxed text-muted-foreground">
                        {sec.content
                          .split('\n')
                          .map((para: string, i: number) => (
                            <p key={i} className="mt-4">
                              {para}
                            </p>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                </CollapsibleContent>

                {/* Trigger Toggle */}
                <motion.div
                  variants={fadeUp}
                  className="flex justify-center pt-4"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full border border-border px-8 py-5 h-auto text-sm font-bold text-brand-ink hover:bg-muted/10 active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isOpen ? t('Collapse policy') : t('View full policy')}
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </motion.div>
              </Collapsible>
            )}

            {/* Important notice block */}
            <motion.div
              variants={fadeUp}
              className="bg-brand-surface-warm border border-border/20 rounded-[2rem] p-6 sm:p-8 flex items-start gap-4 shadow-sm mt-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 shrink-0">
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm">
                <h4 className="font-bold text-brand-ink">{t('Important')}</h4>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  {t(
                    'This Privacy Policy may be updated occasionally. We will notify you of any significant changes via email or platform notice.',
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
