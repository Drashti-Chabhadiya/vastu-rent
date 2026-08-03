import { Star } from 'lucide-react'
import { useAdminRecentReviews } from '#/hook'
import { ExploreLink } from '#/components/common/ExploreLink'
import { UserAvatar } from '#/components/common/UserAvatar'
import { parseCommentImagesAndReply } from '#/lib/review-utils'
import { useTranslation } from '#/context/TranslationContext'

export const RecentReviews = () => {
  const { t, formatDate } = useTranslation()
  const { data: reviews = [], isLoading } = useAdminRecentReviews()

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">{t('Recent Reviews')}</h3>
        <ExploreLink to="/account/reviews">{t('View All')}</ExploreLink>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-muted/50 rounded" />
                <div className="h-2 w-full bg-muted-light rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Star size={36} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm font-bold text-muted-foreground/70">
            {t('No reviews yet')}
          </p>
          <p className="text-xs text-muted-dark mt-1">
            {t('Reviews will appear here once tenants start rating listings.')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="flex items-start justify-between gap-4 group"
            >
              <div className="flex gap-3">
                <UserAvatar
                  image={review.user?.image}
                  name={review.user?.name || 'User'}
                  size="sidebar"
                  avatarClassName="border border-border/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-dash-text">
                      {review.user?.name || 'Anonymous'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[11px] text-dash-text-soft mt-1 leading-relaxed line-clamp-2">
                      {parseCommentImagesAndReply(review.comment).text}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-[140px] border-l border-border/30 pl-4 shrink-0">
                <img
                  src={
                    review.product?.images?.[0] ||
                    '/assets/product-placeholder.png'
                  }
                  alt={review.product?.title}
                  className="w-8 h-8 rounded-md object-cover bg-muted/50"
                />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-dash-text truncate">
                    {review.product?.title}
                  </p>
                  <p className="text-[9px] text-dash-text-muted">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
