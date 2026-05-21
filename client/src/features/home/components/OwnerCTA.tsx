import { Plus } from 'lucide-react'
import { motion } from 'motion/react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function OwnerCTA() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-24"
      >
        <div className="bg-grain absolute inset-0 opacity-[0.4]" />
        <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/70">
              — Become a host
            </div>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,4rem)] leading-[1.02] tracking-tight text-balance">
              Lend the things you love.
              <br />
              <span className="italic opacity-90">Earn while they rest.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[15.5px] leading-relaxed text-primary-foreground/80">
              Open your shelves to neighbors, set your own terms, and turn the
              objects you've already invested in into a gentle stream of income.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-[14px] font-medium text-foreground transition-all hover:bg-background/90"
              >
                List your first item
                <Plus className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3.5 text-[14px] font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10"
              >
                Read the host guide
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
