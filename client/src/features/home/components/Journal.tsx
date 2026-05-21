import type { Variants } from 'motion/react'
import { ArrowUpRight, Calendar, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { useStories } from '#/hook'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function Journal() {
  const { data: fetchedStories } = useStories()

  const displayStories =
    fetchedStories && fetchedStories.length > 0 ? fetchedStories : []

  return (
    <section id="journal" className="bg-surface/70">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
              — Journal
            </div>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.05] tracking-tight text-foreground">
              Stories from the catalogue.
            </h2>
          </div>
          <Link
            to="/journal"
            className="hidden items-center gap-2 text-[13px] font-medium text-foreground/80 underline decoration-border decoration-2 underline-offset-[8px] transition-all hover:text-primary hover:decoration-primary md:inline-flex"
          >
            Read the journal{' '}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {displayStories.map((p: any) => (
            <motion.div variants={fadeUp} key={p.id || p.title}>
              <Link to="/journal" className="group block">
                <div className="relative overflow-hidden rounded-[2rem] bg-background">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-full bg-background/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                      {p.tag}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex items-center gap-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : p.date}
                  </span>
                  <span className="h-px w-6 bg-border" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {p.readTime}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[24px] leading-tight text-foreground transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-foreground transition-all group-hover:gap-3 group-hover:text-primary">
                  Read story <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
