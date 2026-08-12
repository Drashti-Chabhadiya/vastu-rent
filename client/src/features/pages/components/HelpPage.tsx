import {
  Search,
  Mail,
  MessageCircle,
  Phone,
  ChevronDown,
  HelpCircle,
  FileText,
  Settings,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

export function HelpPage() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<string | null>('General-0')
  const [searchQuery, setSearchQuery] = useState('')

  const faqs = [
    {
      category: t('General'),
      questions: [
        {
          q: t('What is Vastu-Rent?'),
          a: t(
            'Vastu-Rent is a community-based rental platform where you can rent almost anything from people in your neighborhood or earn money by listing your own items for rent.',
          ),
        },
        {
          q: t('How do I start renting?'),
          a: t(
            "Simply browse the categories, find an item you need, select your dates, and proceed to book. You'll need to verify your identity before your first rental.",
          ),
        },
      ],
    },
    {
      category: t('Payments'),
      questions: [
        {
          q: t('How does payment work?'),
          a: t(
            'All payments are processed securely through our platform. We hold the funds until the rental is successfully completed to protect both the renter and the lister.',
          ),
        },
        {
          q: t('Is there a security deposit?'),
          a: t(
            "Depending on the item and the lister's preference, some rentals may require a security deposit which is fully refunded once the item is returned in good condition.",
          ),
        },
      ],
    },
  ]

  const filteredFaqs = faqs
    .map((cat, catIdx) => {
      const questions = cat.questions.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      return { ...cat, catIdx, questions }
    })
    .filter((cat) => cat.questions.length > 0)

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <div className="min-h-full bg-background pb-12 sm:pb-20">
      {/* Search Header */}
      <section className="bg-primary py-12 pt-16 sm:py-20 px-4">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl sm:text-4xl font-extrabold text-primary-foreground mb-6 sm:mb-8"
          >
            {t('How can we help you today?')}
          </motion.h1>
          <motion.div
            variants={fadeUp}
            className="relative max-w-2xl mx-auto group"
          >
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors"
              size={24}
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search for answers...')}
              className="w-full h-14 sm:h-16 pl-14 sm:pl-16 pr-6 sm:pr-8 bg-card rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/20 text-base sm:text-lg shadow-xl"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {[
            {
              icon: <HelpCircle className="text-info-foreground" />,
              title: t('Getting Started'),
              count: t('12 articles'),
            },
            {
              icon: <FileText className="text-primary" />,
              title: t('Account & Billing'),
              count: t('8 articles'),
            },
            {
              icon: <Settings className="text-purple-500" />,
              title: t('Using the App'),
              count: t('15 articles'),
            },
            {
              icon: <Shield className="text-destructive" />,
              title: t('Safety & Security'),
              count: t('10 articles'),
            },
          ].map((item, i) => (
            <motion.div
              variants={fadeUp}
              key={i}
              className="bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-border/30 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-muted-light flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base leading-tight sm:leading-normal">
                  {item.title}
                </h3>
              </div>
              <p className="text-[11px] sm:text-sm text-muted-foreground/85 mt-2 sm:mt-0">
                {item.count}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 mb-20">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 px-2"
        >
          {t('Frequently Asked Questions')}
        </motion.h2>
        {filteredFaqs.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-center py-16 bg-card rounded-3xl border border-border/30 shadow-sm"
          >
            <p className="text-base sm:text-lg font-bold text-muted-foreground/80">
              {t('No results found for') + ` "${searchQuery}"`}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/50 mt-1">
              {t('Try searching for different keywords or categories.')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-12"
          >
            {filteredFaqs.map((cat) => (
              <motion.div variants={fadeUp} key={cat.catIdx}>
                <h3 className="text-base sm:text-lg font-bold text-muted-foreground/70 uppercase tracking-widest mb-4 sm:mb-6 px-2">
                  {cat.category}
                </h3>
                <div className="bg-card rounded-2xl sm:rounded-[32px] border border-border/30 shadow-sm overflow-hidden">
                  {cat.questions.map((faq, faqIdx) => {
                    const id = `${cat.catIdx}-${faqIdx}`
                    const isOpen = openIndex === id
                    return (
                      <div
                        key={faqIdx}
                        className={cn(
                          'border-b border-border/30 last:border-0',
                          isOpen && 'bg-muted-light/50',
                        )}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => toggleFaq(id)}
                          className="h-auto w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-muted-light transition-colors rounded-none font-normal [&_svg]:size-5 sm:[&_svg]:size-6"
                        >
                          <span className="text-base sm:text-lg font-bold text-foreground pr-4 sm:pr-8 text-left whitespace-normal leading-snug">
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={cn(
                              'w-6 h-6 text-muted-foreground/70 transition-transform duration-300 shrink-0',
                              isOpen && 'rotate-180',
                            )}
                          />
                        </Button>
                        <div
                          className={cn(
                            'overflow-hidden transition-all duration-300 ease-in-out',
                            isOpen ? 'max-h-96' : 'max-h-0',
                          )}
                        >
                          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Contact Support */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-primary/5 border border-brand/10 rounded-2xl sm:rounded-[40px] p-6 sm:p-10 lg:p-16 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            {t('Still need help?')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-xl mx-auto px-2">
            {t(
              'Our support team is available 24/7 to help you with any questions or issues you might have.',
            )}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-5 sm:gap-8 mx-auto w-fit">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-card flex items-center justify-center shadow-sm">
                <Mail className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest">
                  {t('Email us')}
                </p>
                <p className="font-bold text-foreground text-sm sm:text-base">
                  support@vastu-rent.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-card flex items-center justify-center shadow-sm">
                <MessageCircle className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest">
                  {t('Live Chat')}
                </p>
                <p className="font-bold text-foreground text-sm sm:text-base">
                  {t('Start a conversation')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-card flex items-center justify-center shadow-sm">
                <Phone className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest">
                  {t('Call us')}
                </p>
                <p className="font-bold text-foreground text-sm sm:text-base">
                  +91 79 4000 0000
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
