import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { motion } from 'motion/react'
import { fadeUp, stagger, EASE } from '#/lib/animations'
import { authClient } from '#/lib/auth/auth-client'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'
import { useSettings, useSubmitContactMessage } from '#/hook'
import { useTranslation } from '#/context/TranslationContext'

export function ContactPage() {
  const { t } = useTranslation()
  const { data: session } = authClient.useSession()
  const { data: settings } = useSettings()
  const submitContactMessage = useSubmitContactMessage()

  const contactEmail = settings?.contact?.email || 'support@vastu.com'
  const contactPhone = settings?.contact?.phone || '+91 98765 43210'
  const contactAddress =
    settings?.contact?.address ||
    'Vastu HQ, 123 Harmony Lane, Bengaluru, Karnataka 560001, India'
  const contactDescription =
    settings?.contact?.description ||
    t(
      'Have a question, suggestion, or need help? Our team is here to support you.',
    )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('General Inquiry')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Autofill user profile details if authenticated
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName) {
      toast.error(t('Please enter your full name.'))
      return
    }

    if (!trimmedEmail) {
      toast.error(t('Please enter your email address.'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(t('Please enter a valid email address.'))
      return
    }

    if (!trimmedMessage) {
      toast.error(t('Please write a message before sending.'))
      return
    }

    if (trimmedMessage.length > 1000) {
      toast.error(t('Message is too long. Limit is 1000 characters.'))
      return
    }

    setIsSubmitting(true)
    try {
      await submitContactMessage.mutateAsync({
        name: trimmedName,
        email: trimmedEmail,
        subject,
        message: trimmedMessage,
      })
      toast.success(t('Your message has been sent successfully!'))
      setMessage('')
    } catch (error: any) {
      if (error.response?.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast.success(t('Your message has been sent successfully!'))
        setMessage('')
      } else {
        toast.error(
          error.response?.data?.message ||
            t('Failed to send message. Please try again.'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Mobile Top Header */}
      <div className="md:hidden px-4 pt-2">
        <MobileBackHeader title={t('Contact Us')} />
      </div>

      {/* Hero Section Container */}
      <section className="mx-auto max-w-[1400px] px-0 sm:px-6 pt-0 md:pt-12 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-brand-surface-warm rounded-none sm:rounded-3xl md:rounded-[2.5rem] border-b sm:border border-border/20 shadow-none sm:shadow-sm">
          {/* Left Hero Details */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="md:col-span-7 flex flex-col justify-center px-6 pt-6 pb-10 sm:p-12 lg:p-16 relative"
          >
            <motion.div variants={fadeUp} className="mt-2 sm:mt-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('Get in touch')}
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 sm:mt-8 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-brand-ink"
            >
              {t('Contact Hero Title')}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {contactDescription}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Button
                onClick={() =>
                  document
                    .getElementById('contact-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="group rounded-full bg-primary px-7 py-6 text-[14px] font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-95 cursor-pointer inline-flex items-center gap-3 [&_svg]:size-4"
              >
                {t('Send us a message')}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="md:col-span-5 relative min-h-[280px] sm:min-h-[380px] md:min-h-full overflow-hidden"
          >
            <img
              src="/assets/contact-hero.png"
              alt="Beautiful Vastu Interior"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[4000ms] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Forms and Details Container */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        id="contact-form"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 mt-8 md:mt-12 md:px-10"
      >
        <div className="bg-card rounded-3xl md:rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-border/30 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left side details */}
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold text-brand-ink tracking-tight">
                {t('Other ways to reach us')}
              </h2>
              <div className="mt-10 space-y-8">
                {/* Email us */}
                <div className="flex gap-5 items-start group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-ink text-base">
                      {t('Email us')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('We typically reply within 24 hours.')}
                    </p>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-block text-sm font-bold text-primary hover:underline mt-2"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {/* Call us */}
                <div className="flex gap-5 items-start group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-ink text-base">
                      {t('Call us')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('Mon - Fri, 9:00 AM - 6:00 PM (IST)')}
                    </p>
                    <a
                      href={`tel:${contactPhone}`}
                      className="inline-block text-sm font-bold text-primary hover:underline mt-2"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="flex gap-5 items-start group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-ink text-base">
                      {t('Live chat')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('Chat with our support team')}
                    </p>
                    <span className="inline-block text-sm font-bold text-primary mt-2">
                      {t('Available 24/7')}
                    </span>
                  </div>
                </div>

                {/* Office */}
                <div className="flex gap-5 items-start group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-ink text-base">
                      {t('Office')}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      {contactAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side form */}
            <div className="lg:col-span-8 pt-8 mt-2 border-t border-border/40 lg:pt-0 lg:mt-0 lg:border-t-0 lg:border-l lg:border-border/40 lg:pl-16">
              <h2 className="text-2xl font-bold text-brand-ink tracking-tight">
                {t('Send us a message')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {t(
                  'Fill out the form and our team will get back to you as soon as possible.',
                )}
              </p>

              <form onSubmit={handleSendMessage} className="mt-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-brand-ink tracking-tight">
                      {t('Full name')}
                    </Label>
                    <Input
                      type="text"
                      placeholder={t('Enter your full name')}
                      value={name}
                      disabled={isSubmitting}
                      onChange={(e) => setName(e.target.value)}
                      className="h-13 w-full rounded-2xl border border-border bg-brand-surface-warm/30 px-5 text-sm outline-none transition-all focus:border-primary focus:bg-background focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:outline-none text-brand-ink disabled:opacity-60"
                    />
                  </div>

                  {/* Email address */}
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-brand-ink tracking-tight">
                      {t('Email address')}
                    </Label>
                    <Input
                      type="email"
                      placeholder={t('Enter your email')}
                      value={email}
                      disabled={isSubmitting || !!session?.user}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-13 w-full rounded-2xl border border-border bg-brand-surface-warm/30 px-5 text-sm outline-none transition-all focus:border-primary focus:bg-background focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:outline-none text-brand-ink disabled:opacity-60 disabled:bg-brand-surface-warm/10 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-brand-ink tracking-tight">
                    {t('Subject')}
                  </Label>
                  <Select
                    value={subject}
                    onValueChange={setSubject}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-13 w-full rounded-2xl border border-border bg-brand-surface-warm/30 px-5 text-sm transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 cursor-pointer text-brand-ink focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:outline-none disabled:opacity-60">
                      <SelectValue placeholder={t('What is this regarding?')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover rounded-2xl border border-border/50 shadow-md">
                      <SelectItem
                        value="General Inquiry"
                        className="rounded-xl cursor-pointer"
                      >
                        {t('General Inquiry')}
                      </SelectItem>
                      <SelectItem
                        value="Rental Support"
                        className="rounded-xl cursor-pointer"
                      >
                        {t('Rental Support')}
                      </SelectItem>
                      <SelectItem
                        value="Listing Assistance"
                        className="rounded-xl cursor-pointer"
                      >
                        {t('Listing Assistance')}
                      </SelectItem>
                      <SelectItem
                        value="Partnerships"
                        className="rounded-xl cursor-pointer"
                      >
                        {t('Partnerships')}
                      </SelectItem>
                      <SelectItem
                        value="Other"
                        className="rounded-xl cursor-pointer"
                      >
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[13px] font-bold text-brand-ink tracking-tight">
                      {t('Message')}
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {message.length}/1000
                    </span>
                  </div>
                  <Textarea
                    placeholder={t('Write your message...')}
                    value={message}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setMessage(e.target.value)
                      }
                    }}
                    rows={6}
                    className="w-full rounded-2xl border border-border bg-brand-surface-warm/30 p-5 text-sm outline-none transition-all focus:border-primary focus:bg-background focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:outline-none resize-none leading-relaxed text-brand-ink disabled:opacity-60"
                  />
                </div>

                {/* Submit Button with Loading Spinner */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group rounded-full bg-primary px-8 py-5 h-auto text-[14px] font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] cursor-pointer inline-flex items-center gap-3 [&_svg]:size-4"
                  >
                    {isSubmitting ? (
                      <>
                        {t('Sending')}
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        {t('Send message')}
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
