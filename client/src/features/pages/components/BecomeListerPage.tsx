import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  Coins,
  Camera,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  LayoutDashboard,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { EASE, fadeUp, stagger } from '#/lib/animations'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslation } from '#/context/TranslationContext'

export function BecomeListerPage() {
  const { t } = useTranslation()
  const { data: session } = authClient.useSession()
  const user = session?.user as any
  const isLoggedIn = !!user
  const isProfileComplete = Boolean(user?.addressLine1 && user?.city)

  let targetTo: any = '/signup'
  let targetSearch: any = undefined

  if (isLoggedIn) {
    if (isProfileComplete) {
      targetTo = '/account/listings'
    } else {
      targetTo = '/account'
      targetSearch = { completeProfile: 'true' }
    }
  }

  const features = [
    {
      icon: <Coins className="w-8 h-8 text-primary" />,
      title: t('Earn Extra Income'),
      description: t(
        'Turn your idle items into a steady stream of passive income without any extra effort.',
      ),
    },
    {
      icon: <Camera className="w-8 h-8 text-info-foreground" />,
      title: t('Easy Listing'),
      description: t(
        'Upload photos, set your price, and list your item in less than 2 minutes.',
      ),
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: t('Verified Renters'),
      description: t(
        'All renters are verified through our platform to ensure your items are in safe hands.',
      ),
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: t('Instant Management'),
      description: t(
        'Manage all your rentals, bookings, and earnings from your personalized dashboard.',
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-card pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-foreground text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1600&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-1.5 rounded-full font-bold text-sm">
                {t('JOIN 5,000+ LISTERS')}
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8 leading-tight"
            >
              {t('Turn Your Things Into')}{' '}
              <span className="text-primary">{t('Earnings')}</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl text-muted-dark mb-10 leading-relaxed"
            >
              {t('Lister Hero Description')}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to={targetTo} search={targetSearch}>
                <Button size="lg" className="flex items-center gap-3">
                  {isLoggedIn ? (
                    <>
                      {t('Go to My Listings')}
                      <LayoutDashboard size={20} />
                    </>
                  ) : (
                    <>
                      {t('Start Listing Now')}
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why List Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-foreground mb-4"
            >
              {t('Why list on Vastu-Rent?')}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              {t(
                'We provide the tools and security you need to share your items with confidence.',
              )}
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="flex">
                <Card className="w-full bg-card border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl p-6 group">
                  <CardHeader className="p-0 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center transition-transform group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardTitle className="text-xl font-bold text-foreground mb-3">
                      {feature.title}
                    </CardTitle>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-primary/5 rounded-[40px] overflow-hidden flex flex-col lg:flex-row border border-brand/10"
          >
            <div className="lg:w-1/2 bg-muted/50">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Happy Lister"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ; (e.target as any).src =
                    'https://placehold.co/800x800/166534/FFFFFF/png?text=Happy+Lister'
                }}
              />
            </div>
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-8 italic leading-snug">
                {t('Lister Quote')}
              </h3>
              <div>
                <p className="text-xl font-bold text-primary">Rahul Sharma</p>
                <p className="text-muted-foreground/85">
                  {t('Professional Photographer, Surat')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-bold text-foreground mb-8"
          >
            {t('Your items could be earning for you right now.')}
          </motion.h2>
          <motion.div variants={fadeUp}>
            <Link to={targetTo} search={targetSearch}>
              <Button size="lg">
                {isLoggedIn
                  ? t('Go to My Listings')
                  : t('Get Started for Free')}
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-muted-foreground/85">
            {isLoggedIn
              ? t('Create your first listing in under 2 minutes.')
              : t('No hidden fees. No listing costs. Just earnings.')}
          </motion.p>
        </motion.div>
      </section>
    </div>
  )
}
