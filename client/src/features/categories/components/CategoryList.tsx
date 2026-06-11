import { useCategories } from '#/hook'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export function CategoryList() {
  const { data: categories, isLoading } = useCategories()

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-10 text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold text-foreground tracking-tight mb-4"
          >
            Browse by Categories
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Discover a wide range of rental items organized by categories to
            help you find exactly what you need.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-card rounded-3xl animate-pulse border border-border/30"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {categories?.map((category: any) => (
              <motion.div key={category.id} variants={fadeUp} className="flex">
                <Link
                  to="/categories/$id"
                  params={{ id: String(category.id) }}
                  className="w-full group relative bg-card p-8 rounded-[32px] border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Background Decoration */}
                  <div
                    className="absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150"
                    style={{
                      backgroundColor: category.color || 'var(--color-primary)',
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <CategoryIcon
                      category={category}
                      size="xl"
                      className="mb-6 group-hover:scale-110 transition-transform duration-500"
                    />

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm font-medium text-muted-foreground/85 mb-6 uppercase tracking-wider">
                      {category._count?.products || 0} active listings
                    </p>

                    <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all duration-300">
                      Explore Now
                      <ChevronRight
                        size={18}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
