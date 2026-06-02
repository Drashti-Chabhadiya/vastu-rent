import { Star } from 'lucide-react'
import { useAdminRecentReviews } from '#/hook'
import { ExploreLink } from '#/components/common/ExploreLink'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

export const RecentReviews = () => {
  const { data: reviews = [], isLoading } = useAdminRecentReviews()

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Reviews</h3>
        <ExploreLink to="/account/reviews">View All</ExploreLink>
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
            No reviews yet
          </p>
          <p className="text-xs text-muted-dark mt-1">
            Reviews will appear here once tenants start rating listings.
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
                <Avatar className="w-10 h-10 shrink-0 border border-border/30">
                  <AvatarImage
                    src={review.user?.image || ''}
                    alt={review.user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/5 text-[13px] font-bold text-primary">
                    {review.user?.name?.slice(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
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
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-[140px] border-l border-border/30 pl-4 shrink-0">
                <img
                  src={
                    review.product?.images?.[0] ||
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                  }
                  alt={review.product?.title}
                  className="w-8 h-8 rounded-md object-cover bg-muted/50"
                />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-dash-text truncate">
                    {review.product?.title}
                  </p>
                  <p className="text-[9px] text-dash-text-muted">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
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
