import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const steps = [
  {
    n: '01',
    t: 'Discover',
    d: 'Browse a quietly curated catalogue from neighbors near you.',
  },
  {
    n: '02',
    t: 'Reserve',
    d: 'Pick your dates, message the host, pay through secure escrow.',
  },
  {
    n: '03',
    t: 'Live with it',
    d: 'Pick up or have it delivered. Use it, love it, return it.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
            — How it works
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] tracking-tight text-foreground text-balance">
            A calm, three-step ritual.
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            No subscriptions. No clutter. Just the things you need, for as long
            as you need them.
          </p>
        </div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border lg:col-span-8 lg:grid-cols-3"
        >
          {steps.map((s) => (
            <motion.li
              variants={fadeUp}
              key={s.n}
              className="bg-background p-8 md:p-10"
            >
              <div className="font-display text-[40px] leading-none text-primary">
                {s.n}
              </div>
              <div className="mt-6 font-display text-xl text-foreground">
                {s.t}
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {s.d}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
