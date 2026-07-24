import { useState, useEffect } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import { Star, Leaf, Filter as FilterIcon } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useAdminReviews, useDeleteReview, useReplyToReview } from '#/hook'
import { toast } from 'sonner'
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
import EmptyReviewsState from './components/EmptyReviewsState'
import ReviewCard from './components/ReviewCard'
import { ReviewsManagementSkeleton } from '#/components/skeletons'

export const ReviewsManagement = () => {
  const { t } = useTranslation()
  const { data: sessionData } = authClient.useSession()
  const currentUserId = sessionData?.user?.id
  const [search] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'listings' | 'hosts'>('all')
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

  const deleteMutation = useDeleteReview()

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
      reviewer: {
        id: r.user?.id,
        name: r.user?.name || 'Vastu Renter',
        avatar: r.user?.image,
      },
      postedDate: formatPostedDate(r.createdAt),
      type: r.product ? 'listings' : 'hosts',
      image:
        r.product?.images?.[0] ||
        'https://images.unsplash.com/photo-1545241047-6083a3684587',
    }))
    : []

  const searchedReviews = reviews.filter((r: any) => {
    const term = search.toLowerCase()
    return (
      r.title.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term) ||
      r.host.name.toLowerCase().includes(term)
    )
  })

  const counts = {
    all: searchedReviews.length,
    listings: searchedReviews.filter((r: any) => r.type === 'listings').length,
    hosts: searchedReviews.filter((r: any) => r.type === 'hosts').length,
  }

  const filteredReviews = searchedReviews.filter((r: any) => {
    if (activeTab === 'listings' && r.type !== 'listings') return false
    if (activeTab === 'hosts' && r.type !== 'hosts') return false
    if (ratingFilter !== 'all' && Math.round(r.rating) !== ratingFilter)
      return false
    return true
  })

  const handleDelete = (id: string) => {
    setReviewToDelete(id)
  }

  if (isLoading) {
    return <ReviewsManagementSkeleton />
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {t('Reviews')}
          </h1>
          <p className="text-sm text-muted-foreground/70 font-bold">
            {t("Reviews you've written for your stays and hosts.")}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground/80 font-bold h-10 px-5 flex items-center gap-2 hover:bg-muted-light/50 shadow-sm shrink-0 cursor-pointer"
            >
              <FilterIcon size={14} className="text-muted-foreground/85" />
              {ratingFilter === 'all'
                ? t('All Ratings')
                : `${ratingFilter} ${t('Stars')}`}
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
              {t('All Ratings')}
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
                  ({stars} {t('Stars')})
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

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
                {t(tab.label)} ({counts[tab.id as keyof typeof counts]})
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
              )}
            </Button>
          )
        })}
      </motion.div>

      {filteredReviews.length === 0 ? (
        <EmptyReviewsState activeTab={activeTab} />
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              role={role}
              openDropdownId={openDropdownId}
              onToggleDropdown={(id) =>
                setOpenDropdownId(openDropdownId === id ? null : id)
              }
              onDelete={handleDelete}
              replyingReviewId={replyingReviewId}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onReplySubmit={handleReplySubmit}
              onCancelReply={() => {
                setReplyingReviewId(null)
                setReplyText('')
              }}
              onReplyClick={(reviewId, comment) => {
                setReplyingReviewId(reviewId)
                const parsed = parseCommentImagesAndReply(comment)
                setReplyText(parsed.reply)
              }}
              isSubmittingReply={isSubmittingReply}
            />
          ))}
        </div>
      )}

      <motion.div
        variants={fadeUp}
        className="flex flex-col items-center justify-center py-6 border-t border-border/30 mt-8"
      >
        <div className="text-primary font-black text-xs flex items-center gap-1.5">
          <Leaf size={14} fill="currentColor" className="stroke-[2.5]" />
          {t("That's all your reviews!")}
        </div>
        <p className="text-muted-dark text-[10px] font-bold text-center mt-1">
          {t('Keep sharing your experience and help our community.')}
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
                toast.success(t('Review deleted successfully'))
              },
              onError: () => {
                toast.error(t('Failed to delete review'))
              },
            })
            setReviewToDelete(null)
          }
        }}
        title={t('Delete Review')}
        description={t(
          'Are you sure you want to permanently delete this review? This action cannot be undone.',
        )}
        confirmText={t('Delete')}
        variant="danger"
      />
    </motion.div>
  )
}
