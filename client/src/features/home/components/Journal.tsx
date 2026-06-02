import type { Variants } from 'motion/react'
import { Calendar, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { useStories } from '#/hook'
import { cn } from '../../../lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'

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
    fetchedStories && fetchedStories.length > 0
      ? fetchedStories.slice(0, 3)
      : []

  return (
    <section id="journal" className="bg-surface/70">
      <div
        className={cn(
          'mx-auto',
          'max-w-[1400px]',
          'px-6',
          'py-24',
          'md:px-10',
          'md:py-32',
        )}
      >
        <div className={cn('flex', 'items-end', 'justify-between', 'gap-6')}>
          <div>
            <div
              className={cn(
                'text-[11px]',
                'uppercase',
                'tracking-[0.22em]',
                'text-primary',
              )}
            >
              — Journal
            </div>
            <h2
              className={cn(
                'mt-4',
                'font-display',
                'text-[clamp(2.1rem,4vw,3.25rem)]',
                'leading-[1.05]',
                'tracking-tight',
                'text-foreground',
              )}
            >
              Stories from the catalogue.
            </h2>
          </div>
          <ExploreLink to="/journal" className="hidden md:inline-flex">
            Read the journal
          </ExploreLink>
        </div>

        {displayStories.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={cn(
              'mt-14',
              'grid',
              'grid-cols-1',
              'gap-8',
              'md:grid-cols-3',
            )}
          >
            {displayStories.map((p: any) => (
              <motion.div variants={fadeUp} key={p.id || p.title}>
                <Link to="/journal" className={cn('group', 'block')}>
                  <div
                    className={cn(
                      'relative',
                      'overflow-hidden',
                      'rounded-[2rem]',
                      'bg-background',
                    )}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      width={800}
                      height={600}
                      loading="lazy"
                      className={cn(
                        'aspect-[4/3]',
                        'w-full',
                        'object-cover',
                        'transition-transform',
                        'duration-[1500ms]',
                        'ease-out',
                        'group-hover:scale-[1.08]',
                      )}
                    />
                    <div
                      className={cn(
                        'absolute',
                        'inset-0',
                        'bg-black/0',
                        'transition-colors',
                        'duration-500',
                        'group-hover:bg-black/5',
                      )}
                    />
                    <div className={cn('absolute', 'bottom-4', 'left-4')}>
                      <span
                        className={cn(
                          'rounded-full',
                          'bg-background/95',
                          'px-4',
                          'py-1.5',
                          'text-[10px]',
                          'font-semibold',
                          'uppercase',
                          'tracking-[0.14em]',
                          'text-foreground',
                          'backdrop-blur-sm',
                        )}
                      >
                        {p.tag}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'mt-7',
                      'flex',
                      'items-center',
                      'gap-5',
                      'text-[10px]',
                      'uppercase',
                      'tracking-[0.2em]',
                      'text-muted-foreground/80',
                    )}
                  >
                    <span className={cn('flex', 'items-center', 'gap-1.5')}>
                      <Calendar className={cn('h-3', 'w-3')} />
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : p.date}
                    </span>
                    <span className={cn('h-px', 'w-6', 'bg-border')} />
                    <span className={cn('flex', 'items-center', 'gap-1.5')}>
                      <Clock className={cn('h-3', 'w-3')} />
                      {p.readTime}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'mt-4',
                      'font-display',
                      'text-[24px]',
                      'leading-tight',
                      'text-foreground',
                      'transition-colors',
                      'group-hover:text-primary',
                    )}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-3',
                      'line-clamp-2',
                      'text-[15px]',
                      'leading-relaxed',
                      'text-muted-foreground',
                    )}
                  >
                    {p.excerpt}
                  </p>
                  <ExploreLink className="mt-6 text-foreground group-hover:text-primary group-hover:gap-3 text-[12px] font-semibold transition-all">
                    Read story
                  </ExploreLink>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div
            className={cn(
              'mt-14',
              'grid',
              'grid-cols-1',
              'gap-8',
              'md:grid-cols-3',
            )}
          />
        )}
      </div>
    </section>
  )
}
