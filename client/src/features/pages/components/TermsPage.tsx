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

export function TermsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('intro')
  const { data: settings } = useSettings()

  const lastUpdated = settings?.terms?.lastUpdated || '28 May 2026'

  const dynamicSections = settings?.terms?.sections || [
    {
      id: 'intro',
      title: '1. Introduction',
      content:
        'Welcome to Vastu. These Terms of Service ("Terms") govern your access to and use of the Vastu website, mobile application, and any related services (collectively, the "Platform") operated by Vastu Rentals Private Limited ("we", "us", or "our").\n\nBy accessing or using our Platform, you agree to be bound by these Terms.',
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      content:
        'You must be at least 18 years old and legally capable of entering into binding contracts to use Vastu. By using our Platform, you represent and warrant that you meet these requirements.',
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      content:
        'To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.',
    },
    {
      id: 'bookings',
      title: '4. Listings and Bookings',
      content:
        'Users can list items for rent and book items listed by others. We do not own the items listed on Vastu and act solely as an intermediary between users.\n\nWe reserve the right to remove any listing or user that violates these Terms or our policies.',
    },
    {
      id: 'payments',
      title: '5. Payments and Fees',
      content:
        'All payments must be made through our secure payment system. We may charge service fees for certain transactions, which will be clearly displayed before you complete a booking.\n\nYou agree to pay all applicable fees and taxes.',
    },
    {
      id: 'cancellations',
      title: '6. Cancellations and Refunds',
      content:
        'Cancellation policies and refund eligibility are governed by the terms specified at the time of booking. Users must resolve disputes through Vastu support in alignment with our formal Refund Policy.',
    },
    {
      id: 'conduct',
      title: '7. User Conduct',
      content:
        "Users agree to behave professionally, not list prohibited items, and not bypass Vastu's secure system or direct transactions off-platform. Any attempt to negotiate or transact off-platform will lead to account suspension.",
    },
    {
      id: 'intellectual',
      title: '8. Intellectual Property',
      content:
        'All content, designs, trademarks, logos, and code displayed on the Vastu Platform are owned by Vastu Rentals and protected by copyright and intellectual property laws.',
    },
    {
      id: 'liability',
      title: '9. Limitation of Liability',
      content:
        'Vastu acts as a secure platform and venue, and is not liable for any physical damages, loss of earnings, or disputes arising between users. Renters and hosts accept all operational risks.',
    },
    {
      id: 'indemnity',
      title: '10. Indemnification',
      content:
        'Users agree to defend, indemnify, and hold harmless Vastu, its affiliates, and its officers from any claims, losses, or legal expenses arising from their use of the platform or violation of these Terms.',
    },
    {
      id: 'changes',
      title: '11. Changes to Terms',
      content:
        'Vastu reserves the right to modify these Terms at any time. Your continued use of the platform after updates have been published constitutes acceptance of the new terms.',
    },
    {
      id: 'governing',
      title: '12. Governing Law',
      content:
        'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. All disputes are subject to exclusive jurisdiction in Bengaluru.',
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      content:
        'For any questions regarding these Terms of Service, please contact us at support@vastu.com or through our Contact page.',
    },
  ]

  interface TermsNavSection {
    id: string
    label: string
    collapsedOnly: boolean
  }

  const sections: TermsNavSection[] = dynamicSections.map(
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

  // Monitor scroll to update active sidebar section highlight
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
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section Container */}
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
                Terms of Service
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-brand-ink"
            >
              Clear terms. <br />
              <span className="italic text-primary">Trusted platform.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              These Terms of Service govern your use of Vastu. <br />
              By using our platform, you agree to these terms.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <span className="inline-flex rounded-full bg-primary px-5 py-3 text-[13px] font-bold text-primary-foreground">
                Last updated: {lastUpdated}
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
                    On this page
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
                      Questions about these terms?
                    </h4>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      We’re here to help.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group"
                  >
                    Contact Support
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
                      {isOpen ? 'Collapse terms' : 'View all terms'}
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
                <h4 className="font-bold text-brand-ink">Important</h4>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  These Terms may be updated from time to time. Continued use of
                  Vastu after changes means you accept the updated Terms.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
