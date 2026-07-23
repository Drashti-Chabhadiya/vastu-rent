import { Link } from '@tanstack/react-router'
import { ArrowLeft, Heart, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

interface WishlistHeroHeaderProps {
  isPageLoading: boolean
  wishlistLength: number
  productsLength: number
  isFetching: boolean
  onRefresh: () => void
}

export function WishlistHeroHeader({
  isPageLoading,
  wishlistLength,
  productsLength,
  isFetching,
  onRefresh,
}: WishlistHeroHeaderProps) {
  const { t, formatNumber } = useTranslation()

  return (
    <>
      <motion.div variants={fadeUp} className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground/85 hover:text-foreground transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          {t('Back to Home')}
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-danger flex items-center justify-center shadow-sm">
                <Heart
                  size={20}
                  className="text-danger-foreground fill-rose-500"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-danger-foreground bg-danger px-3 py-1 rounded-full">
                {t('My Wishlist')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              {t('Saved Items')}
            </h1>
            <p className="text-sm text-muted-foreground/85 font-medium mt-1">
              {isPageLoading
                ? t('Loading your saved items…')
                : t('{count} items saved for later').replace(
                    '{count}',
                    formatNumber(wishlistLength),
                  )}
            </p>
          </div>

          {!isPageLoading && productsLength > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border/30 shadow-sm px-4 py-2.5 rounded-2xl">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs font-black text-foreground/80">
                  {t('{count} saved').replace(
                    '{count}',
                    formatNumber(productsLength),
                  )}
                </span>
              </div>
              <Button
                onClick={onRefresh}
                disabled={isFetching}
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl text-xs text-muted-foreground/85 hover:text-foreground border-border/30 hover:border-border"
              >
                <RefreshCw
                  size={13}
                  className={isFetching ? 'animate-spin' : ''}
                />
                {t('Refresh')}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
