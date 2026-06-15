import { useState, useEffect } from 'react'
import {
  Trash2,
  Star,
  ChevronRight,
  Leaf,
  MoreVertical,
  Filter as FilterIcon,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { useAdminReviews, useDeleteReview, useReplyToReview } from '#/hook'
import { toast } from 'sonner'
import { UserAvatar } from '#/components/common/UserAvatar'
import { authClient } from '#/lib/auth/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import {
  formatStayDates,
  formatPostedDate,
  parseCommentImagesAndReply,
} from '#/lib/review-utils'

// Custom StarRating component to handle full stars, fractional stars (half-filled), and empty stars high-fidelity
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        if (rating >= starValue) {
          return (
            <Star
              key={i}
              size={15}
              className="text-primary fill-primary stroke-primary shrink-0"
            />
          )
        } else if (rating > i && rating < starValue) {
          return (
            <div key={i} className="relative w-[15px] h-[15px] shrink-0">
              <Star
                size={15}
                className="text-muted-foreground/30 fill-slate-200 stroke-slate-200 absolute top-0 left-0"
              />
              <div className="absolute top-0 left-0 overflow-hidden w-[50%] h-full">
                <Star
                  size={15}
                  className="text-primary fill-primary stroke-primary max-w-none"
                />
              </div>
            </div>
          )
        } else {
          return (
            <Star
              key={i}
              size={15}
              className="text-muted-foreground/30 fill-slate-200 stroke-slate-200 shrink-0"
            />
          )
        }
      })}
    </div>
  )
}

export const ReviewsManagement = () => {
  const [search] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'listings' | 'hosts'>(
    'all',
  )
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  const replyToReview = useReplyToReview()

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res.data?.user) {
        setRole(res.data.user.role ?? null)
      }
    })
  }, [])

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message.')
      return
    }
    try {
      setIsSubmittingReply(true)
      await replyToReview.mutateAsync({ reviewId, replyText })
      toast.success('Reply submitted successfully!')
      setReplyingReviewId(null)
      setReplyText('')
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit reply.'
      toast.error(errMsg)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const { data: serverReviews, isLoading } = useAdminReviews({ search })

  console.log('serverReviews', serverReviews)
  const deleteMutation = useDeleteReview()

  // Map server reviews to uniform UI cards structure from the API response
  const reviews = serverReviews
    ? serverReviews.map((r: any) => ({
        id: r.id,
        productId: r.product?.id,
        title: r.product?.title || 'Rental Item',
        location: r.product?.location || 'India',
        rating: r.rating || 5,
        dates: formatStayDates(r.createdAt),
        comment: r.comment || 'Perfect rental experience!',
        host: {
          name: r.product?.user?.name || 'Vastu Lister',
          avatar:
            r.product?.user?.image ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        },
        postedDate: formatPostedDate(r.createdAt),
        type: r.product ? 'listings' : 'hosts',
        image:
          r.product?.images?.[0] ||
          'https://images.unsplash.com/photo-1545241047-6083a3684587',
      }))
    : []

  // Local Search filtering
  const searchedReviews = reviews.filter((r: any) => {
    const term = search.toLowerCase()
    return (
      r.title.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term) ||
      r.host.name.toLowerCase().includes(term)
    )
  })

  // Dynamic grouping tab counts
  const counts = {
    all: searchedReviews.length,
    listings: searchedReviews.filter((r: any) => r.type === 'listings').length,
    hosts: searchedReviews.filter((r: any) => r.type === 'hosts').length,
  }

  // Filter reviews by tab and rating selection
  const filteredReviews = searchedReviews.filter((r: any) => {
    // 1. Tab filter
    if (activeTab === 'listings' && r.type !== 'listings') return false
    if (activeTab === 'hosts' && r.type !== 'hosts') return false

    // 2. Rating filter
    if (ratingFilter !== 'all' && Math.round(r.rating) !== ratingFilter)
      return false

    return true
  })

  const handleDelete = (id: string) => {
    setReviewToDelete(id)
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded-full w-48" />
            <div className="h-4 bg-muted/50 rounded-full w-80" />
          </div>
          <div className="h-10 bg-muted rounded-full w-24" />
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-6 border-b border-border/30 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-muted rounded-full w-20" />
          ))}
        </div>
        {/* List Skeleton */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm flex flex-col md:flex-row gap-6 animate-pulse"
            >
              <div className="w-32 h-32 rounded-2xl bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted rounded-full w-48" />
                <div className="h-4 bg-muted-light/80 rounded-full w-32" />
                <div className="h-4 bg-muted/50 rounded-full w-56 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Header Block */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Reviews
          </h1>
          <p className="text-sm text-muted-foreground/70 font-bold">
            Reviews you've written for your stays and hosts.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground/80 font-bold h-10 px-5 flex items-center gap-2 hover:bg-muted-light/50 shadow-sm shrink-0 cursor-pointer"
            >
              <FilterIcon size={14} className="text-muted-foreground/85" />
              {ratingFilter === 'all' ? 'All Ratings' : `${ratingFilter} Stars`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border/30/80 rounded-xl shadow-lg p-1 min-w-[150px]">
            <DropdownMenuItem
              onClick={() => setRatingFilter('all')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                ratingFilter === 'all' && 'text-primary bg-primary/5',
              )}
            >
              All Ratings
            </DropdownMenuItem>
            {[5, 4, 3, 2, 1].map((stars) => (
              <DropdownMenuItem
                key={stars}
                onClick={() => setRatingFilter(stars)}
                className={cn(
                  'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary flex items-center gap-1.5',
                  ratingFilter === stars && 'text-primary bg-primary/5',
                )}
              >
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="font-bold text-muted-foreground">
                  ({stars} Stars)
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Tabs Filter Navigation */}
      <motion.div
        variants={fadeUp}
        className="flex gap-6 border-b border-border/30 pb-px overflow-x-auto custom-scrollbar"
      >
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'listings', label: 'Listings' },
          { id: 'hosts', label: 'Hosts' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'pb-3 font-semibold text-sm transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent',
                isActive
                  ? 'text-primary'
                  : 'text-muted-dark hover:text-muted-foreground',
              )}
            >
              <span>
                {tab.label} ({counts[tab.id as keyof typeof counts]})
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
              )}
            </Button>
          )
        })}
      </motion.div>

      {/* Reviews Card List */}
      {filteredReviews.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-dashed border-border"
        >
          <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mb-4">
            <Star className="text-muted-dark fill-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-foreground/90">
            No {activeTab} reviews
          </h3>
          <p className="text-muted-dark text-xs mt-1.5 max-w-xs text-center font-bold">
            You don't have any reviews listed under this category right now.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review: any) => (
            <motion.div
              variants={fadeUp}
              key={review.id}
              className="group bg-card p-6 rounded-3xl border border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.035)] transition-all duration-300 flex flex-col md:grid md:grid-cols-[auto_1fr_auto] gap-8 items-start relative"
            >
              {/* Left Side Image */}
              <div className="w-full md:w-[240px] h-48 md:h-[160px] rounded-2xl overflow-hidden shrink-0 bg-muted-light shadow-inner relative">
                <img
                  src={review.image}
                  alt={review.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Middle details column */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {review.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/85 mt-1 font-medium">
                    {review.location}
                  </p>
                </div>

                {/* Rating & Date Stacked Vertically */}
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

                {/* Review Message & Parsed Attachments & Reply */}
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

                      {/* Attachments */}
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

                      {/* Render Lister's Reply */}
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

              {/* Right side Reviewed Host Profile & Button */}
              <div className="flex flex-col justify-between items-stretch shrink-0 w-full md:w-[180px] min-h-[160px] pt-4 md:pt-0 border-t md:border-t-0 border-border/30">
                {/* Host Row */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {/* <img
                      src={review.host.avatar}
                      alt={review.host.name}
                      className="w-9 h-9 rounded-full object-cover border border-border/30 shadow-sm shrink-0"
                    /> */}
                    <UserAvatar
                      image={review.host.avatar || review.host.image}
                      name={review.host.name}
                      size="trigger"
                    />
                    <div className="text-left">
                      <p className="text-[10px] text-muted-dark font-bold uppercase tracking-wider leading-none">
                        Reviewed Host
                      </p>
                      <p className="text-xs font-bold text-foreground mt-1 leading-none">
                        {review.host.name}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown (Admins Only) */}
                  {role === 'admin' && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-dark hover:text-muted-foreground h-8 w-8 flex items-center justify-center cursor-pointer shrink-0"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === review.id ? null : review.id,
                          )
                        }
                      >
                        <MoreVertical size={16} />
                      </Button>

                      {openDropdownId === review.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-0 top-8 bg-card rounded-xl shadow-lg border border-border/30 p-1 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setOpenDropdownId(null)
                                handleDelete(review.id)
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

                {/* View Listing Button */}
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
                      View Listing
                      <ChevronRight
                        size={14}
                        className="text-primary stroke-[2.5]"
                      />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="rounded-xl border-border text-muted-dark font-bold text-xs px-4 h-9 flex items-center justify-center gap-1 opacity-50 w-full mt-3 md:mt-0"
                  >
                    View Listing
                    <ChevronRight size={14} className="text-muted-dark" />
                  </Button>
                )}

                {/* Reply to Review Option (Listers Only) */}
                {role === 'user' && (
                  <div className="w-full mt-2 space-y-2">
                    {replyingReviewId === review.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write your response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 border border-border rounded-xl text-xs outline-none focus:border-primary/50 font-medium min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={isSubmittingReply}
                            className="rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            {isSubmittingReply ? '...' : 'Submit'}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setReplyingReviewId(null)
                              setReplyText('')
                            }}
                            className="rounded-lg bg-muted-light text-muted-foreground/85 font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer border border-border/50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyingReviewId(review.id)
                          const parsed = parseCommentImagesAndReply(
                            review.comment,
                          )
                          setReplyText(parsed.reply)
                        }}
                        className="rounded-xl border-border text-primary font-semibold text-xs px-4 h-9 flex items-center justify-center gap-1.5 hover:bg-muted-light/50 shadow-sm w-full"
                      >
                        {(() => {
                          const parsed = parseCommentImagesAndReply(
                            review.comment,
                          )
                          return parsed.reply ? 'Edit Reply' : 'Reply to Review'
                        })()}
                      </Button>
                    )}
                  </div>
                )}

                {/* Posted Date */}
                <span className="text-[11px] text-muted-dark font-semibold text-left mt-2 md:mt-0">
                  Posted on {review.postedDate}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* That's All Confirmation Footer */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col items-center justify-center py-6 border-t border-border/30 mt-8"
      >
        <div className="text-primary font-black text-xs flex items-center gap-1.5">
          <Leaf size={14} fill="currentColor" className="stroke-[2.5]" />
          That's all your reviews!
        </div>
        <p className="text-muted-dark text-[10px] font-bold text-center mt-1">
          Keep sharing your experience and help our community.
        </p>
      </motion.div>

      <ReusableAlertDialog
        isOpen={reviewToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setReviewToDelete(null)
        }}
        onConfirm={() => {
          if (reviewToDelete) {
            deleteMutation.mutate(reviewToDelete, {
              onSuccess: () => {
                toast.success('Review deleted successfully')
              },
              onError: () => {
                toast.error('Failed to delete review')
              },
            })
            setReviewToDelete(null)
          }
        }}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </motion.div>
  )
}
