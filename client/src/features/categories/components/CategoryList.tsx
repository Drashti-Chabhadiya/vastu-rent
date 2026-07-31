import { useCategories } from '#/hook'
import { CategoryIcon } from '#/components/common/CategoryIcon'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

export function CategoryList() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useCategories()

  return (
    <div className="min-h-screen bg-background pt-6 lg:pt-24 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <MobileBackHeader title={t('Categories')} />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-6 md:mb-10 text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2 md:mb-4"
          >
            {t('Browse by Categories')}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
          >
            {t(
              'Discover a wide range of rental items organized by categories to help you find exactly what you need.',
            )}
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {categories?.map((category: any) => (
              <motion.div key={category.id} variants={fadeUp} className="flex">
                <Link
                  to="/categories/$id"
                  params={{ id: String(category.id) }}
                  className="w-full group relative bg-card p-4 sm:p-8 rounded-3xl sm:rounded-[32px] border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden flex flex-col justify-between"
                >
                  {/* Background Decoration */}
                  <div
                    className="absolute -right-4 -top-4 w-20 h-20 sm:w-32 sm:h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150"
                    style={{
                      backgroundColor: category.color || 'var(--color-primary)',
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
                    <CategoryIcon
                      category={category}
                      size="xl"
                      className="mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-500 scale-75 sm:scale-100"
                    />

                    <h3 className="text-sm sm:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-none">
                      {category.name}
                    </h3>

                    <p className="text-[9px] sm:text-sm font-medium text-muted-foreground/85 mb-3 sm:mb-6 uppercase tracking-wider">
                      {category._count?.products || 0} <span className="hidden sm:inline">{t('active listings')}</span><span className="sm:hidden">{t('listings')}</span>
                    </p>

                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold text-primary group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-300">
                      {t('Explore')}
                      <ChevronRight
                        className="transition-transform group-hover:translate-x-0.5 w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]"
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
