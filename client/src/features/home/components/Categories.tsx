import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import * as Icons from 'lucide-react'
import { useCategories } from '#/hook'
import { Link } from '@tanstack/react-router'
import { CategoryCardSkeleton } from '#/components/skeletons'
import { ExploreLink } from '#/components/common/ExploreLink'

const getIcon = (iconName: string): Icons.LucideIcon => {
  if (!iconName) return Icons.Sparkles

  // Try exact lookup (e.g. "HomeIcon" or "Home")
  if ((Icons as any)[iconName]) {
    return (Icons as any)[iconName]
  }

  // Try stripping "Icon" suffix (e.g. "HomeIcon" -> "Home")
  if (iconName.endsWith('Icon')) {
    const stripped = iconName.slice(0, -4)
    if ((Icons as any)[stripped]) {
      return (Icons as any)[stripped]
    }
  }

  // Try adding "Icon" suffix (e.g. "Home" -> "HomeIcon")
  const withIconSuffix = `${iconName}Icon`
  if ((Icons as any)[withIconSuffix]) {
    return (Icons as any)[withIconSuffix]
  }

  return Icons.Sparkles
}

const IconComponent = ({
  iconName,
  color,
}: {
  iconName: string
  color?: string
}) => {
  const Icon = getIcon(iconName)

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundColor: color ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--primary-10)',
      }}
    >
      <Icon
        className="h-12 w-12"
        style={{
          color: color ?? 'var(--primary)',
        }}
        strokeWidth={1.5}
      />
    </div>
  )
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function Categories() {
  const { data: categories, isLoading } = useCategories()

  const latestCategories = categories
    ? [...categories]
        .sort((a: any, b: any) => b.id.localeCompare(a.id))
        .slice(0, 4)
    : []

  return (
    <section
      id="categories"
      className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32 bg-background"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary">
            — The Catalogue
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-tight text-foreground text-balance">
            Quietly considered, beautifully kept.
          </h2>
        </div>
        <div className="flex flex-col gap-4 max-w-sm">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Browse a slow-edited selection across home, work and play — every
            item kept in condition by neighbors who care.
          </p>
          <ExploreLink to="/categories">Explore all categories</ExploreLink>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {latestCategories.map((c: any) => (
            <motion.div key={c.id} variants={fadeUp}>
              <Link
                to="/categories/$id"
                params={{ id: c.id }}
                className="group relative overflow-hidden rounded-[1.75rem] bg-card block"
              >
                <div className="relative overflow-hidden bg-accent/30 aspect-[4/5]">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      width={800}
                      height={1024}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <IconComponent iconName={c.icon} color={c.color} />
                  )}
                  {c.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-foreground backdrop-blur">
                      {c.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-1 py-5">
                  <div>
                    <div className="font-display text-lg text-foreground">
                      {c.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {c._count?.products || 0} items
                    </div>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icons.ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
