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
import { useAdminReviews, useDeleteReview } from '#/hook'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { authClient } from '#/lib/auth/auth-client'
import { apiClient } from '#/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

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
              className="text-[#2d5222] fill-[#2d5222] stroke-[#2d5222] shrink-0"
            />
          )
        } else if (rating > i && rating < starValue) {
          return (
            <div key={i} className="relative w-[15px] h-[15px] shrink-0">
              <Star
                size={15}
                className="text-slate-200 fill-slate-200 stroke-slate-200 absolute top-0 left-0"
              />
              <div className="absolute top-0 left-0 overflow-hidden w-[50%] h-full">
                <Star
                  size={15}
                  className="text-[#2d5222] fill-[#2d5222] stroke-[#2d5222] max-w-none"
                />
              </div>
            </div>
          )
        } else {
          return (
            <Star
              key={i}
              size={15}
              className="text-slate-200 fill-slate-200 stroke-slate-200 shrink-0"
            />
          )
        }
      })}
    </div>
  )
}

// Custom Date Formatters to match screenshot layout exactly (DD Month - DD Month YYYY) across all systems
const formatStayDates = (createdAtStr: string) => {
  if (!createdAtStr) return '20 May – 27 May 2024'
  const createdDate = new Date(createdAtStr)
  if (isNaN(createdDate.getTime())) return '20 May – 27 May 2024'

  // Stay start is calculated as 9 days prior to the review submission
  const startDate = new Date(createdDate.getTime())
  startDate.setDate(startDate.getDate() - 9)

  // Stay end is calculated as 2 days prior to the review submission
  const endDate = new Date(createdDate.getTime())
  endDate.setDate(endDate.getDate() - 2)

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const startDay = startDate.getDate().toString()
  const startMonth = months[startDate.getMonth()]

  const endDay = endDate.getDate().toString()
  const endMonth = months[endDate.getMonth()]
  const endYear = endDate.getFullYear()

  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`
}

const formatPostedDate = (createdAtStr: string) => {
  if (!createdAtStr) return '29 May 2024'
  const date = new Date(createdAtStr)
  if (isNaN(date.getTime())) return '29 May 2024'

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

const parseCommentImagesAndReply = (comment: string) => {
  if (!comment) return { text: '', images: [], reply: '' }

  let images: string[] = []
  const imagesMatch = comment.match(/\[Images:\s*([^\]]+)\]/)
  if (imagesMatch) {
    const imagesStr = imagesMatch[1]
    images = imagesStr
      .split(',')
      .map((img: string) => img.trim())
      .filter(Boolean)
  }

  let reply = ''
  const replyMatch = comment.match(/\[Reply:\s*([^\]]+)\]/)
  if (replyMatch) {
    reply = replyMatch[1].trim()
  }

  const text = comment
    .replace(/\[Images:\s*([^\]]+)\]/, '')
    .replace(/\[Reply:\s*([^\]]+)\]/, '')
    .trim()

  return { text, images, reply }
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

  const queryClient = useQueryClient()

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
      await apiClient.post(`/reviews/${reviewId}/reply`, { replyText })
      toast.success('Reply submitted successfully!')
      setReplyingReviewId(null)
      setReplyText('')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
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
          name: r.product?.owner?.name || 'Vastu Host',
          avatar:
            r.product?.owner?.image ||
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
    if (confirm('Permanently delete this review?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Review deleted successfully')
        },
        onError: () => {
          toast.error('Failed to delete review')
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded-full w-48" />
            <div className="h-4 bg-slate-100 rounded-full w-80" />
          </div>
          <div className="h-10 bg-slate-200 rounded-full w-24" />
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-6 border-b border-slate-100 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-slate-200 rounded-full w-20" />
          ))}
        </div>
        {/* List Skeleton */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 animate-pulse"
            >
              <div className="w-32 h-32 rounded-2xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded-full w-48" />
                <div className="h-4 bg-slate-150 rounded-full w-32" />
                <div className="h-4 bg-slate-100 rounded-full w-56 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Reviews
          </h1>
          <p className="text-sm text-gray-400 font-bold">
            Reviews you've written for your stays and hosts.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 font-bold h-10 px-5 flex items-center gap-2 hover:bg-slate-50/50 shadow-sm shrink-0 cursor-pointer"
            >
              <FilterIcon size={14} className="text-slate-500" />
              {ratingFilter === 'all' ? 'All Ratings' : `${ratingFilter} Stars`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-slate-100/80 rounded-xl shadow-lg p-1 min-w-[150px]">
            <DropdownMenuItem
              onClick={() => setRatingFilter('all')}
              className={cn(
                'text-xs font-semibold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 focus:bg-[#2d5222]/5 focus:text-[#2d5222]',
                ratingFilter === 'all' && 'text-[#2d5222] bg-[#2d5222]/5',
              )}
            >
              All Ratings
            </DropdownMenuItem>
            {[5, 4, 3, 2, 1].map((stars) => (
              <DropdownMenuItem
                key={stars}
                onClick={() => setRatingFilter(stars)}
                className={cn(
                  'text-xs font-semibold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 focus:bg-[#2d5222]/5 focus:text-[#2d5222] flex items-center gap-1.5',
                  ratingFilter === stars && 'text-[#2d5222] bg-[#2d5222]/5',
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
                <span className="font-bold text-slate-600">
                  ({stars} Stars)
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs Filter Navigation */}
      <div className="flex gap-6 border-b border-slate-100 pb-px overflow-x-auto custom-scrollbar">
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
                  ? 'text-[#2d5222]'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <span>
                {tab.label} ({counts[tab.id as keyof typeof counts]})
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2d5222] rounded-full" />
              )}
            </Button>
          )
        })}
      </div>

      {/* Reviews Card List */}
      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Star className="text-slate-300 fill-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-gray-800">
            No {activeTab} reviews
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-xs text-center font-bold">
            You don't have any reviews listed under this category right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review: any) => (
            <div
              key={review.id}
              className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.035)] transition-all duration-300 flex flex-col md:grid md:grid-cols-[auto_1fr_auto] gap-8 items-start relative"
            >
              {/* Left Side Image */}
              <div className="w-full md:w-[240px] h-48 md:h-[160px] rounded-2xl overflow-hidden shrink-0 bg-slate-50 shadow-inner relative">
                <img
                  src={review.image}
                  alt={review.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Middle details column */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {review.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {review.location}
                  </p>
                </div>

                {/* Rating & Date Stacked Vertically */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-bold text-slate-400">
                      • {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
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
                        <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-xl">
                          {text}
                        </p>
                      )}

                      {/* Attachments */}
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {images.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm hover:scale-[1.03] transition-all cursor-pointer shrink-0 group/revimg"
                              onClick={() => window.open(imgUrl, '_blank')}
                            >
                              <img
                                src={imgUrl}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/revimg:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase">
                                View
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Owner's Reply */}
                      {reply && (
                        <div className="bg-[#f9faf6] border border-[#2d5222]/10 p-4 rounded-2xl max-w-xl mt-3 space-y-1 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2d5222] rounded-full animate-pulse" />
                          <div className="pl-3.5 space-y-1">
                            <p className="text-[10px] text-[#2d5222] font-black uppercase tracking-wider">
                              Host Reply
                            </p>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
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
              <div className="flex flex-col justify-between items-stretch shrink-0 w-full md:w-[180px] min-h-[160px] pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Host Row */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {/* <img
                      src={review.host.avatar}
                      alt={review.host.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                    /> */}
                    <Avatar className="w-9 h-9">
                      <AvatarImage
                        src={review.host.image || ''}
                        alt={review.host.name}
                      />
                      <AvatarFallback className="bg-[#2d5222]/5 text-[13px] font-bold text-[#2d5222]">
                        {review.host.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                        Reviewed Host
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1 leading-none">
                        {review.host.name}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown (Admins & SuperAdmins Only) */}
                  {(role === 'admin' || role === 'superAdmin') && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-slate-400 hover:text-slate-600 h-8 w-8 flex items-center justify-center cursor-pointer shrink-0"
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
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setOpenDropdownId(null)
                                handleDelete(review.id)
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors justify-start h-auto"
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
                      className="rounded-xl border-slate-200 text-[#2d5222] font-bold text-xs px-4 h-9 flex items-center justify-center gap-1 hover:bg-slate-50/50 shadow-sm active:scale-95 cursor-pointer w-full"
                    >
                      View Listing
                      <ChevronRight
                        size={14}
                        className="text-[#2d5222] stroke-[2.5]"
                      />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="rounded-xl border-slate-200 text-slate-400 font-bold text-xs px-4 h-9 flex items-center justify-center gap-1 opacity-50 w-full mt-3 md:mt-0"
                  >
                    View Listing
                    <ChevronRight size={14} className="text-slate-300" />
                  </Button>
                )}

                {/* Reply to Review Option (Owners Only) */}
                {role === 'owner' && (
                  <div className="w-full mt-2 space-y-2">
                    {replyingReviewId === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Write your response as the host..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#2d5222]/50 font-medium min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={isSubmittingReply}
                            className="rounded-lg bg-[#2d5222] hover:bg-[#1e3816] text-white font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            {isSubmittingReply ? '...' : 'Submit'}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setReplyingReviewId(null)
                              setReplyText('')
                            }}
                            className="rounded-lg bg-slate-50 text-slate-500 font-bold text-[10px] h-7 px-3 flex-1 flex items-center justify-center cursor-pointer border border-slate-200/50"
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
                        className="rounded-xl border-slate-200 text-[#2d5222] font-semibold text-xs px-4 h-9 flex items-center justify-center gap-1.5 hover:bg-slate-50/50 shadow-sm w-full"
                      >
                        {(() => {
                          const parsed = parseCommentImagesAndReply(
                            review.comment,
                          )
                          return parsed.reply
                            ? 'Edit Host Reply'
                            : 'Reply to Review'
                        })()}
                      </Button>
                    )}
                  </div>
                )}

                {/* Posted Date */}
                <span className="text-[11px] text-slate-400 font-semibold text-left mt-2 md:mt-0">
                  Posted on {review.postedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* That's All Confirmation Footer */}
      <div className="flex flex-col items-center justify-center py-6 border-t border-slate-100 mt-8">
        <div className="text-[#2d5222] font-black text-xs flex items-center gap-1.5">
          <Leaf size={14} fill="currentColor" className="stroke-[2.5]" />
          That's all your reviews!
        </div>
        <p className="text-slate-400 text-[10px] font-bold text-center mt-1">
          Keep sharing your experience and help our community.
        </p>
      </div>
    </div>
  )
}
