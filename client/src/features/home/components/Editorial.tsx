import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { CreditCard, Leaf, ShieldCheck, Star } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'
// import featureKitchen from '../../../../public/assets/feature-kitchen.jpg'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function Editorial() {
  const { t } = useTranslation()

  return (
    <section className="bg-surface/70">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-6 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative overflow-hidden rounded-2xl lg:col-span-7"
        >
          <img
            src="/images/living-room.png"
            alt="A beautiful living room setup"
            width={1024}
            height={800}
            loading="lazy"
            className="aspect-[5/4] w-full object-cover"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="lg:col-span-5 lg:py-8"
        >
          <motion.div
            variants={fadeUp}
            className="text-[11px] uppercase tracking-[0.22em] text-primary"
          >
            — Manifesto № 01
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.1] tracking-tight text-foreground text-balance"
          >
            {t('Less ownership. More presence.')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-[15.5px] leading-relaxed text-muted-foreground"
          >
            {t(
              'Vastu is built on a simple belief: a well-made object should be used, not stored. We connect homes that have, with homes that need — turning idle quality into shared abundance.',
            )}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            {[
              {
                icon: ShieldCheck,
                t: t('Trusted community'),
                d: t('Verified profiles, transparent reviews, real neighbors.'),
              },
              {
                icon: CreditCard,
                t: t('Secure payments'),
                d: t('Escrow protection, fair pricing, no surprises.'),
              },
              {
                icon: Leaf,
                t: t('Sustainable living'),
                d: t('Every rental keeps another object out of landfill.'),
              },
              {
                icon: Star,
                t: t('Editor curated'),
                d: t('Listings hand-picked for quality and care.'),
              },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-2xl border border-border bg-background/60 p-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="mt-4 font-display text-[17px] text-foreground">
                  {f.t}
                </div>
                <div className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {f.d}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
