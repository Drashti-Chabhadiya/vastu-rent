import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ShieldCheck, Leaf, CreditCard, ArrowRight, Star } from 'lucide-react'
import heroImg from '../../../../public/assets/hero-living.jpg'
import featureNook from '../../../../public/assets/feature-nook.jpg'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 pb-16 pt-12 md:px-10 md:pt-16 lg:grid-cols-12 lg:gap-14 lg:pb-24">
        {/* Left column */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-6 lg:pt-10"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('Issue 04 · Spring Catalogue')}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-7 font-display text-[clamp(2.75rem,6vw,5.25rem)] leading-[1.02] tracking-[-0.03em] text-foreground text-balance"
          >
            {t('Rent anything.')}
            <br />
            <span className="italic text-primary">{t('Live in harmony.')}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-md text-[15.5px] leading-relaxed text-muted-foreground text-pretty"
          >
            {t('Hero Description')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#categories"
              className="group inline-flex items-center gap-3 rounded-full bg-primary py-3.5 pl-6 pr-3 text-[14px] font-medium text-primary-foreground shadow-soft transition-all hover:shadow-lift"
            >
              {t('Explore the catalogue')}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-500 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href="#how-it-works"
              className="text-[14px] text-foreground/80 underline decoration-border decoration-1 underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary"
            >
              {t('How it works')}
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              { k: '5,000+', v: t('Active members') },
              { k: '10,000+', v: t('Items in rotation') },
              { k: '25k kg', v: t('CO₂ saved') },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-2xl text-foreground md:text-3xl">
                  {s.k}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column — editorial image stack */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE }}
          className="relative lg:col-span-6"
        >
          <div className="relative overflow-hidden rounded-[2.25rem] bg-surface shadow-lift">
            <img
              src={heroImg}
              alt="Sage green pendant lamp over a cream linen armchair in an arched alcove"
              width={1080}
              height={1350}
              className="aspect-[4/5] h-full w-full object-cover"
            />
            {/* floating tag */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('Featured · The Linen Armchair')}
            </motion.div>

            {/* product card overlay */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 rounded-2xl bg-background/95 p-4 backdrop-blur-md md:bottom-7 md:left-7 md:right-7 md:p-5"
            >
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Living · Stockholm
                </div>
                <div className="mt-1 font-display text-lg text-foreground">
                  Mira Lounge Chair
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" /> 4.96 ·
                  Hosted by Anneli
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-foreground">
                  €18<span className="text-sm text-muted-foreground">/wk</span>
                </div>
                <Button
                  variant="link"
                  className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-primary hover:underline p-0 h-auto"
                >
                  {t('Reserve')}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* small side image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -bottom-10 -left-6 hidden w-44 overflow-hidden rounded-2xl border border-border bg-background shadow-soft md:block lg:-left-20 lg:w-52"
          >
            <img
              src={featureNook}
              alt="A sage green velvet armchair beside an arched window"
              width={208}
              height={260}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* trust strip */}
      <div className="border-y border-border bg-surface/60">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-10 gap-y-4 px-6 py-5 text-[12px] uppercase tracking-[0.2em] text-muted-foreground md:px-10">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> {t('Verified hosts')}
          </span>
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> {t('Secure payments')}
          </span>
          <span className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" /> {t('Circular by design')}
          </span>
          <span className="hidden items-center gap-2 md:flex">
            <Star className="h-4 w-4 text-primary" /> {t('4.9 average rating')}
          </span>
          <span className="hidden items-center gap-2 lg:flex">
            Featured in Kinfolk · Cereal · Apartamento
          </span>
        </div>
      </div>
    </section>
  )
}
