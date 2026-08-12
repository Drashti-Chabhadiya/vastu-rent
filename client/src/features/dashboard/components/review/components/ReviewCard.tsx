import { motion } from 'motion/react'
import { fadeUp } from '#/lib/animations'
import { Trash2, ChevronRight, MoreVertical } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { UserAvatar } from '#/components/common/UserAvatar'
import { parseCommentImagesAndReply } from '#/lib/review-utils'
import StarRating from './StarRating'

interface ReviewCardProps {
  review: any
  currentUserId: string | undefined
  role: string | null
  openDropdownId: string | null
  onToggleDropdown: (id: string) => void
  onDelete: (id: string) => void
  replyingReviewId: string | null
  replyText: string
  onReplyTextChange: (text: string) => void
  onReplySubmit: (reviewId: string) => void
  onCancelReply: () => void
  onReplyClick: (reviewId: string, comment: string) => void
  isSubmittingReply: boolean
}

const ReviewCard = ({
  review,
  currentUserId,
  role,
  openDropdownId,
  onToggleDropdown,
  onDelete,
  replyingReviewId,
  replyText,
  onReplyTextChange,
  onReplySubmit,
  onCancelReply,
  onReplyClick,
  isSubmittingReply,
}: ReviewCardProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      variants={fadeUp}
      key={review.id}
      className="group bg-card p-6 rounded-3xl border border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.035)] transition-all duration-300 flex flex-col md:grid md:grid-cols-[auto_1fr_auto] gap-8 items-start relative"
    >
      <div className="w-full md:w-[240px] h-48 md:h-[160px] rounded-2xl overflow-hidden shrink-0 bg-muted-light shadow-inner relative">
        <img
          src={review.image}
          alt={review.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground leading-tight">
            {review.title}
          </h3>
          <p className="text-xs text-muted-foreground/85 mt-1 font-medium">
            {review.location}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <StarRating rating={review.rating} />
            <span className="text-xs font-bold text-muted-dark">
              • {review.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-dark font-semibold">
            {review.dates}
          </p>
        </div>

        {(() => {
          const { text, images, reply } = parseCommentImagesAndReply(
            review.comment,
          )
          return (
            <div className="space-y-4">
              {text && (
                <p className="text-sm text-muted-foreground font-normal leading-relaxed max-w-xl">
                  {text}
                </p>
              )}

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/30 bg-muted-light shadow-sm hover:scale-[1.03] transition-all cursor-pointer shrink-0 group/revimg"
                      onClick={() => window.open(imgUrl, '_blank')}
                    >
                      <img
                        src={imgUrl}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/revimg:opacity-100 transition-opacity flex items-center justify-center text-primary-foreground text-[9px] font-black uppercase">
                        View
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reply && (
                <div className="bg-background border border-primary/10 p-4 rounded-2xl max-w-xl mt-3 space-y-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-full animate-pulse" />
                  <div className="pl-3.5 space-y-1">
                    <p className="text-[10px] text-primary font-black uppercase tracking-wider">
                      Lister Reply
                    </p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {reply}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <div className="flex flex-col justify-between items-stretch shrink-0 w-full md:w-[180px] min-h-[160px] pt-4 md:pt-0 border-t md:border-t-0 border-border/30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            {(() => {
              const isOwnReview = currentUserId === review.reviewer.id
              const displayName = isOwnReview
                ? review.host.name
                : review.reviewer.name
              const displayAvatar = isOwnReview
                ? review.host.avatar
                : review.reviewer.avatar
              const displayLabel = isOwnReview ? 'Reviewed Host' : 'Reviewed By'
              return (
                <>
                  <UserAvatar
                    image={displayAvatar}
                    name={displayName}
                    size="trigger"
                  />
                  <div className="text-left">
                    <p className="text-[10px] text-muted-dark font-bold uppercase tracking-wider leading-none">
                      {displayLabel}
                    </p>
                    <p className="text-xs font-bold text-foreground mt-1 leading-none">
                      {displayName}
                    </p>
                  </div>
                </>
              )
            })()}
          </div>

          {role === 'admin' && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-dark hover:text-muted-foreground h-8 w-8 flex items-center justify-center cursor-pointer shrink-0"
                onClick={() => onToggleDropdown(review.id)}
              >
                <MoreVertical size={16} />
              </Button>

              {openDropdownId === review.id && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => onToggleDropdown(review.id)}
                  />
                  <div className="absolute right-0 top-8 bg-card rounded-xl shadow-lg border border-border/30 p-1 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
                    <Button
                      variant="ghost"
                      onClick={onCancelReply}
                      className="flex-1 rounded-full font-bold bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onToggleDropdown(review.id)
                        onDelete(review.id)
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-danger hover:text-destructive rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors justify-start h-auto"
                    >
                      <Trash2 size={13} />
                      Delete Review
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {review.productId ? (
          <a
            href={`/products/${review.productId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 md:mt-0"
          >
            <Button
              variant="outline"
              className="rounded-xl border-border text-primary font-bold text-xs px-4 h-9 flex items-center justify-center gap-1 hover:bg-muted-light/50 shadow-sm active:scale-95 cursor-pointer w-full"
            >
              {t('View Listing')}
              <ChevronRight size={14} className="text-primary stroke-[2.5]" />
            </Button>
          </a>
        ) : (
          <Button
            variant="outline"
            disabled
            className="rounded-xl border-border text-muted-dark font-bold text-xs px-4 h-9 flex items-center justify-center gap-1 opacity-50 w-full mt-3 md:mt-0"
          >
            {t('View Listing')}
            <ChevronRight size={14} className="text-muted-dark" />
          </Button>
        )}

        {role === 'user' && (
          <div className="w-full mt-2 space-y-2">
            {replyingReviewId === review.id ? (
              <div className="space-y-2">
                <Textarea
                  placeholder={t('Write your response...')}
                  value={replyText}
                  onChange={(e) => onReplyTextChange(e.target.value)}
                  className="w-full p-2 border border-border rounded-xl text-xs outline-none focus:border-primary/50 font-medium min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => onReplySubmit(review.id)}
                    disabled={isSubmittingReply}
                    className="rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    {isSubmittingReply ? '...' : 'Submit'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onCancelReply}
                    className="rounded-lg bg-muted-light text-muted-foreground/85 font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer border border-border/50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => onReplyClick(review.id, review.comment)}
                className="rounded-xl border-border text-primary font-semibold text-xs px-4 h-9 flex items-center justify-center gap-1.5 hover:bg-muted-light/50 shadow-sm w-full"
              >
                {(() => {
                  const parsed = parseCommentImagesAndReply(review.comment)
                  return parsed.reply ? t('Edit Reply') : t('Reply to Review')
                })()}
              </Button>
            )}
          </div>
        )}

        <span className="text-[11px] text-muted-dark font-semibold text-left mt-2 md:mt-0">
          {t('Posted on')} {review.postedDate}
        </span>
      </div>
    </motion.div>
  )
}

export default ReviewCard
