import { useMyRentals } from '#/hook'
import {
  Calendar,
  MapPin,
  IndianRupee,
  ChevronRight,
  SlidersHorizontal,
  HelpCircle,
  MessageSquare,
  Users,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Textarea } from '#/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export const MyBookings = () => {
  const { data: rentals, isLoading } = useMyRentals()
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  >('upcoming')
  const [paymentFilter, setPaymentFilter] = useState<
    'all' | 'paid' | 'pending'
  >('all')

  // Review submission states
  const [selectedRental, setSelectedRental] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Booking details states
  const [selectedDetailsRental, setSelectedDetailsRental] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const reviewMutation = useMutation({
    mutationFn: async (params: {
      productId: string
      rating: number
      comment: string
    }) => {
      const { productId, rating: reviewRating, comment: reviewComment } = params
      const res = await apiClient.post('/reviews', {
        rating: reviewRating,
        comment: reviewComment,
        productId,
      })
      return res.data.review
    },
    onSuccess: (_, variables) => {
      toast.success('Review submitted successfully!')
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
      })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      })
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
      setIsReviewDialogOpen(false)
      setRating(5)
      setComment('')
      setUploadedImages([])
    },
    onError: () => {
      toast.error('Failed to submit review. Please try again.')
    },
  })

  if (isLoading) {
    return (
      <div className={cn('space-y-8', 'animate-pulse')}>
        {/* Header Skeleton */}
        <div className={cn('flex', 'justify-between', 'items-center')}>
          <div className="space-y-2">
            <div
              className={cn('h-8', 'bg-slate-200', 'rounded-full', 'w-48')}
            />
            <div
              className={cn('h-4', 'bg-slate-100', 'rounded-full', 'w-80')}
            />
          </div>
          <div className={cn('h-10', 'bg-slate-200', 'rounded-full', 'w-24')} />
        </div>
        {/* Tabs Skeleton */}
        <div
          className={cn(
            'flex',
            'gap-6',
            'border-b',
            'border-slate-100',
            'pb-2',
          )}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn('h-5', 'bg-slate-200', 'rounded-full', 'w-20')}
            />
          ))}
        </div>
        {/* List Skeleton */}
        <div className={cn('grid', 'gap-4')}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-white',
                'p-6',
                'rounded-[2.5rem]',
                'border',
                'border-slate-100',
                'shadow-sm',
                'flex',
                'flex-col',
                'md:flex-row',
                'gap-6',
              )}
            >
              <div
                className={cn(
                  'w-32',
                  'h-32',
                  'rounded-2xl',
                  'bg-slate-100',
                  'shrink-0',
                )}
              />
              <div className={cn('flex-1', 'space-y-3')}>
                <div
                  className={cn('h-5', 'bg-slate-200', 'rounded-full', 'w-48')}
                />
                <div
                  className={cn('h-4', 'bg-slate-150', 'rounded-full', 'w-32')}
                />
                <div
                  className={cn(
                    'h-4',
                    'bg-slate-100',
                    'rounded-full',
                    'w-56',
                    'mt-4',
                  )}
                />
              </div>
              <div
                className={cn(
                  'w-48',
                  'flex',
                  'flex-col',
                  'items-end',
                  'gap-2',
                  'shrink-0',
                )}
              >
                <div
                  className={cn('h-4', 'bg-slate-200', 'rounded-full', 'w-24')}
                />
                <div
                  className={cn('h-5', 'bg-slate-200', 'rounded-full', 'w-32')}
                />
                <div
                  className={cn(
                    'h-9',
                    'bg-slate-150',
                    'rounded-full',
                    'w-28',
                    'mt-2',
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Define dynamic status grouping
  const getBookingGroup = (
    status: string,
  ): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
    const s = status.toLowerCase()
    if (s === 'pending' || s === 'confirmed') return 'upcoming'
    if (s === 'picked_up' || s === 'in_use') return 'ongoing'
    if (s === 'returned' || s === 'completed') return 'completed'
    if (s === 'cancelled' || s === 'rejected') return 'cancelled'
    return 'upcoming' // fallback
  }

  // Calculate dynamic tab counts
  const counts = {
    upcoming:
      rentals?.filter((r: any) => getBookingGroup(r.status) === 'upcoming')
        .length || 0,
    ongoing:
      rentals?.filter((r: any) => getBookingGroup(r.status) === 'ongoing')
        .length || 0,
    completed:
      rentals?.filter((r: any) => getBookingGroup(r.status) === 'completed')
        .length || 0,
    cancelled:
      rentals?.filter((r: any) => getBookingGroup(r.status) === 'cancelled')
        .length || 0,
  }

  // Filter rentals based on active tab and payment filter
  const filteredRentals =
    rentals?.filter((r: any) => {
      // 1. Tab status filter
      if (getBookingGroup(r.status) !== activeTab) return false

      // 2. Payment filter
      if (paymentFilter !== 'all' && r.paymentStatus !== paymentFilter)
        return false

      return true
    }) || []

  const getStatusBadge = (status: string) => {
    const group = getBookingGroup(status)
    switch (group) {
      case 'upcoming':
        return (
          <Badge
            className={cn(
              'bg-[#fef3c7]',
              'hover:bg-[#fef3c7]',
              'text-[#d97706]',
              'border-none',
              'px-3.5',
              'py-1',
              'rounded-full',
              'font-bold',
              'text-xs',
              'shrink-0',
              'shadow-sm',
              'shadow-amber-500/5',
            )}
          >
            Upcoming
          </Badge>
        )
      case 'ongoing':
        return (
          <Badge
            className={cn(
              'bg-[#e0e7ff]',
              'hover:bg-[#e0e7ff]',
              'text-[#4f46e5]',
              'border-none',
              'px-3.5',
              'py-1',
              'rounded-full',
              'font-bold',
              'text-xs',
              'shrink-0',
              'shadow-sm',
            )}
          >
            Ongoing
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            className={cn(
              'bg-[#dcfce7]',
              'hover:bg-[#dcfce7]',
              'text-[#15803d]',
              'border-none',
              'px-3.5',
              'py-1',
              'rounded-full',
              'font-bold',
              'text-xs',
              'shrink-0',
              'shadow-sm',
            )}
          >
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge
            className={cn(
              'bg-[#fee2e2]',
              'hover:bg-[#fee2e2]',
              'text-[#b91c1c]',
              'border-none',
              'px-3.5',
              'py-1',
              'rounded-full',
              'font-bold',
              'text-xs',
              'shrink-0',
              'shadow-sm',
            )}
          >
            Cancelled
          </Badge>
        )
    }
  }

  return (
    <div className={cn('space-y-8', 'animate-in', 'fade-in', 'duration-500')}>
      {/* Top Header Block */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'sm:flex-row',
          'sm:items-center',
          'justify-between',
          'gap-4',
        )}
      >
        <div className="space-y-1">
          <h1
            className={cn(
              'text-3xl',
              'font-black',
              'text-gray-900',
              'tracking-tight',
            )}
          >
            My Bookings
          </h1>
          <p className={cn('text-sm', 'text-gray-400', 'font-bold')}>
            Manage your upcoming and past bookings.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full',
                'border-slate-200',
                'text-slate-700',
                'font-bold',
                'h-10',
                'px-5',
                'flex',
                'items-center',
                'gap-2',
                'hover:bg-slate-50/50',
                'shadow-sm',
                'shrink-0',
                'cursor-pointer',
              )}
            >
              <SlidersHorizontal size={14} className="text-slate-400" />
              {paymentFilter === 'all'
                ? 'Filter'
                : paymentFilter === 'paid'
                  ? 'Paid Bookings'
                  : 'Unpaid Bookings'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              'bg-white',
              'border-slate-100/80',
              'rounded-xl',
              'shadow-lg',
              'p-1',
              'min-w-[160px]',
            )}
          >
            <DropdownMenuItem
              onClick={() => setPaymentFilter('all')}
              className={cn(
                'text-xs font-semibold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 focus:bg-[#2d5222]/5 focus:text-[#2d5222]',
                paymentFilter === 'all' && 'text-[#2d5222] bg-[#2d5222]/5',
              )}
            >
              All Payments
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('paid')}
              className={cn(
                'text-xs font-semibold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 focus:bg-[#2d5222]/5 focus:text-[#2d5222]',
                paymentFilter === 'paid' && 'text-[#2d5222] bg-[#2d5222]/5',
              )}
            >
              Paid Bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('pending')}
              className={cn(
                'text-xs font-semibold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 focus:bg-[#2d5222]/5 focus:text-[#2d5222]',
                paymentFilter === 'pending' && 'text-[#2d5222] bg-[#2d5222]/5',
              )}
            >
              Pending Payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs Filter Navigation */}
      <div
        className={cn(
          'flex',
          'gap-6',
          'border-b',
          'border-slate-100',
          'pb-px',
          'overflow-x-auto',
          'custom-scrollbar',
        )}
      >
        {(['upcoming', 'ongoing', 'completed', 'cancelled'] as const).map(
          (tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-3 font-extrabold text-[13px] capitalize transition-all relative shrink-0',
                  isActive
                    ? 'text-[#2d5222]'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <span>
                  {tab} ({counts[tab]})
                </span>
                {isActive && (
                  <div
                    className={cn(
                      'absolute',
                      'bottom-0',
                      'left-0',
                      'right-0',
                      'h-0.5',
                      'bg-[#2d5222]',
                      'rounded-full',
                    )}
                  />
                )}
              </button>
            )
          },
        )}
      </div>

      {/* Bookings Card List */}
      {filteredRentals.length === 0 ? (
        <div
          className={cn(
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'py-20',
            'bg-white',
            'rounded-[2.5rem]',
            'border',
            'border-dashed',
            'border-slate-200',
          )}
        >
          <div
            className={cn(
              'w-16',
              'h-16',
              'bg-slate-50',
              'rounded-full',
              'flex',
              'items-center',
              'justify-center',
              'mb-4',
            )}
          >
            <Calendar className="text-slate-300" size={32} />
          </div>
          <h3 className={cn('text-lg', 'font-extrabold', 'text-gray-800')}>
            No {activeTab} bookings
          </h3>
          <p
            className={cn(
              'text-slate-400',
              'text-xs',
              'mt-1.5',
              'max-w-xs',
              'text-center',
              'font-bold',
            )}
          >
            You don't have any bookings matching this status right now.
          </p>
        </div>
      ) : (
        <div className={cn('grid', 'gap-5')}>
          {filteredRentals.map((rental: any) => {
            const nights = Math.max(
              1,
              Math.ceil(
                (new Date(rental.endDate).getTime() -
                  new Date(rental.startDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
            return (
              <div
                key={rental.id}
                className={cn(
                  'group',
                  'bg-white',
                  'p-6',
                  'rounded-[2.5rem]',
                  'border',
                  'border-slate-100',
                  'shadow-sm',
                  'hover:shadow-md',
                  'transition-all',
                  'duration-300',
                  'flex',
                  'flex-col',
                  'md:flex-row',
                  'gap-6',
                  'items-start',
                  'md:items-center',
                  'relative',
                )}
              >
                {/* Left side Image with link */}
                <div
                  className={cn(
                    'w-32',
                    'h-32',
                    'rounded-2xl',
                    'overflow-hidden',
                    'shrink-0',
                    'bg-slate-50',
                    'shadow-inner',
                  )}
                >
                  <img
                    src={
                      rental.product?.images?.[0] ||
                      'https://placehold.co/128?text=Vastu'
                    }
                    alt={rental.product?.title}
                    className={cn(
                      'w-full',
                      'h-full',
                      'object-cover',
                      'transition-transform',
                      'duration-500',
                      'group-hover:scale-105',
                    )}
                  />
                </div>

                {/* Middle details column */}
                <div className={cn('flex-1', 'space-y-4')}>
                  <div>
                    <h3
                      className={cn(
                        'text-[17px]',
                        'font-black',
                        'text-gray-900',
                        'leading-tight',
                      )}
                    >
                      {rental.product?.title}
                    </h3>
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'gap-1',
                        'text-[11px]',
                        'font-bold',
                        'text-slate-400',
                        'mt-1',
                      )}
                    >
                      <MapPin size={12} className="text-[#2d5222]" />
                      <span>
                        {rental.product?.location ||
                          rental.product?.city ||
                          'Ahmedabad, India'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'gap-2',
                        'text-xs',
                        'font-bold',
                        'text-slate-500',
                      )}
                    >
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {format(new Date(rental.startDate), 'dd MMMM')} –{' '}
                        {format(new Date(rental.endDate), 'dd MMMM, yyyy')}{' '}
                        <span className="text-slate-400">
                          ({nights} {nights === 1 ? 'Night' : 'Nights'})
                        </span>
                      </span>
                    </div>
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'gap-2',
                        'text-xs',
                        'font-bold',
                        'text-slate-500',
                      )}
                    >
                      <Users size={13} className="text-slate-400" />
                      <span>
                        {rental.product?.category?.name || 'Vastu Rental'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side stats and button */}
                <div
                  className={cn(
                    'flex',
                    'flex-col',
                    'items-start',
                    'md:items-end',
                    'gap-3',
                    'shrink-0',
                    'self-stretch',
                    'justify-between',
                    'md:text-right',
                    'border-t',
                    'md:border-t-0',
                    'border-slate-50',
                    'pt-4',
                    'md:pt-0',
                    'w-full',
                    'md:w-auto',
                  )}
                >
                  <div className="space-y-1">
                    <p
                      className={cn(
                        'text-[10px]',
                        'text-slate-400',
                        'font-extrabold',
                        'uppercase',
                        'tracking-wider',
                      )}
                    >
                      Booking ID:{' '}
                      <span className={cn('font-mono', 'text-slate-500')}>
                        #BK{rental.id.slice(-6).toUpperCase()}
                      </span>
                    </p>
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'md:justify-end',
                        'gap-1.5',
                        'text-xs',
                        'font-bold',
                        'text-slate-500',
                        'mt-1',
                      )}
                    >
                      <span className={cn('text-slate-400', 'font-extrabold')}>
                        Total Amount
                      </span>
                      <span
                        className={cn(
                          'text-base',
                          'font-black',
                          'text-gray-900',
                          'flex',
                          'items-center',
                        )}
                      >
                        <IndianRupee size={14} className="stroke-[3]" />
                        {rental.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex',
                      'items-center',
                      'md:justify-end',
                      'gap-3',
                      'w-full',
                      'md:w-auto',
                      'flex-wrap',
                      'md:flex-nowrap',
                    )}
                  >
                    {getStatusBadge(rental.status)}

                    {getBookingGroup(rental.status) === 'completed' && (
                      <>
                        {rental.product?.reviews &&
                        rental.product.reviews.length > 0 ? (
                          <div
                            className={cn(
                              'flex',
                              'items-center',
                              'gap-2',
                              'flex-wrap',
                            )}
                          >
                            <Badge
                              className={cn(
                                'bg-[#f0f9eb]',
                                'hover:bg-[#f0f9eb]',
                                'text-[#2d5222]',
                                'border-none',
                                'px-3.5',
                                'py-1.5',
                                'rounded-full',
                                'font-bold',
                                'text-xs',
                                'shrink-0',
                                'shadow-sm',
                                'flex',
                                'items-center',
                                'gap-1.5',
                              )}
                            >
                              <CheckCircle2
                                size={12}
                                className="text-[#2d5222]"
                              />
                              Review Submitted
                            </Badge>

                            {/* Allow edit within 7 days */}
                            {(() => {
                              const review = rental.product.reviews[0]
                              const createdTime = new Date(
                                review.createdAt,
                              ).getTime()
                              const diffDays =
                                (new Date().getTime() - createdTime) /
                                (1000 * 60 * 60 * 24)

                              if (diffDays <= 7) {
                                return (
                                  <Button
                                    onClick={() => {
                                      setSelectedRental(rental)
                                      setRating(review.rating)
                                      // Extract actual comment text (stripping images block if present)
                                      const commentText = review.comment
                                        ? review.comment.split(
                                            '\n\n[Images:',
                                          )[0]
                                        : ''
                                      setComment(commentText)
                                      setIsReviewDialogOpen(true)
                                    }}
                                    className={cn(
                                      'rounded-full',
                                      'bg-[#f4f7f4]',
                                      'hover:bg-[#eaf0ea]',
                                      'text-[#2d5222]',
                                      'font-black',
                                      'text-[11px]',
                                      'px-3.5',
                                      'h-8',
                                      'flex',
                                      'items-center',
                                      'justify-center',
                                      'border',
                                      'border-[#2d5222]/15',
                                      'active:scale-95',
                                      'transition-all',
                                      'cursor-pointer',
                                      'shadow-sm',
                                    )}
                                  >
                                    Edit Review
                                  </Button>
                                )
                              }
                              return null
                            })()}
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedRental(rental)
                              setRating(5)
                              setComment('')
                              setIsReviewDialogOpen(true)
                            }}
                            className={cn(
                              'rounded-full',
                              'bg-[#2d5222]',
                              'hover:bg-[#1e3816]',
                              'text-white',
                              'font-extrabold',
                              'text-xs',
                              'px-4',
                              'h-9',
                              'flex',
                              'items-center',
                              'justify-center',
                              'shadow-sm',
                              'active:scale-95',
                              'cursor-pointer',
                            )}
                          >
                            Write Review
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDetailsRental(rental)
                        setIsDetailsDialogOpen(true)
                      }}
                      className={cn(
                        'rounded-full',
                        'border-slate-200',
                        'text-[#2d5222]',
                        'font-black',
                        'text-xs',
                        'px-4',
                        'h-9',
                        'flex',
                        'items-center',
                        'gap-1',
                        'hover:bg-slate-50/50',
                        'shadow-sm',
                        'active:scale-95',
                        'cursor-pointer',
                      )}
                    >
                      View Details
                      <ChevronRight
                        size={14}
                        className={cn('text-[#2d5222]', 'stroke-[3]')}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Need Help Booking Banner */}
      <div
        className={cn(
          'bg-[#fdfcf9]',
          'rounded-[2.5rem]',
          'border',
          'border-slate-100',
          'p-6',
          'flex',
          'flex-col',
          'sm:flex-row',
          'items-center',
          'justify-between',
          'gap-4',
          'mt-8',
          'shadow-sm',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-4', 'text-left')}>
          <div
            className={cn(
              'w-12',
              'h-12',
              'rounded-full',
              'bg-[#f4f8f1]',
              'flex',
              'items-center',
              'justify-center',
              'text-[#2d5222]',
              'shrink-0',
              'border',
              'border-[#e2edd8]',
            )}
          >
            <HelpCircle size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className={cn('font-extrabold', 'text-gray-900', 'text-sm')}>
              Need help with your booking?
            </h4>
            <p
              className={cn(
                'text-slate-400',
                'text-xs',
                'font-semibold',
                'mt-0.5',
              )}
            >
              Our support team is here to assist you.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className={cn(
            'rounded-full',
            'border-slate-200',
            'text-slate-700',
            'font-black',
            'px-6',
            'h-10',
            'flex',
            'items-center',
            'gap-1.5',
            'hover:bg-slate-50',
            'shadow-sm',
            'cursor-pointer',
          )}
        >
          <MessageSquare
            size={15}
            className={cn('text-slate-400', 'shrink-0')}
          />
          Contact Support
        </Button>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent
          className={cn(
            'max-w-xl',
            'p-0',
            'border-none',
            'bg-slate-50',
            'rounded-[2.5rem]',
            'shadow-2xl',
            'font-sans',
            'overflow-hidden',
          )}
        >
          {/* Top Product Banner card */}
          <div className={cn('relative', 'h-44', 'bg-slate-900')}>
            {selectedDetailsRental?.product?.images?.[0] && (
              <img
                src={selectedDetailsRental.product.images[0]}
                alt=""
                className={cn('w-full', 'h-full', 'object-cover', 'opacity-60')}
              />
            )}
            <div
              className={cn(
                'absolute',
                'inset-0',
                'bg-gradient-to-t',
                'from-slate-900',
                'via-slate-900/40',
                'to-transparent',
              )}
            />
            <div
              className={cn(
                'absolute',
                'bottom-6',
                'left-6',
                'right-6',
                'flex',
                'items-end',
                'justify-between',
              )}
            >
              <div>
                <span
                  className={cn(
                    'text-[9px]',
                    'font-black',
                    'uppercase',
                    'tracking-widest',
                    'text-[#2d5222]',
                    'bg-[#f4f8f1]',
                    'px-2',
                    'py-1',
                    'rounded-md',
                    'border',
                    'border-[#e2edd8]',
                  )}
                >
                  {selectedDetailsRental?.product?.category?.name ||
                    'Vastu Rental'}
                </span>
                <h3
                  className={cn(
                    'text-xl',
                    'font-extrabold',
                    'text-white',
                    'leading-tight',
                    'font-display',
                    'mt-2.5',
                  )}
                >
                  {selectedDetailsRental?.product?.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Core Details body */}
          <div
            className={cn(
              'p-6',
              'space-y-5',
              'max-h-[80vh]',
              'overflow-y-auto',
              'custom-scrollbar',
            )}
          >
            {/* Owner & Status columns */}
            <div className={cn('grid', 'grid-cols-2', 'gap-4')}>
              <div
                className={cn(
                  'bg-white',
                  'p-4',
                  'rounded-2xl',
                  'border',
                  'border-slate-100/80',
                  'space-y-1',
                )}
              >
                <span
                  className={cn(
                    'text-[8px]',
                    'font-black',
                    'text-slate-400',
                    'uppercase',
                    'tracking-widest',
                    'block',
                  )}
                >
                  Host Details
                </span>
                <div
                  className={cn(
                    'text-xs',
                    'font-bold',
                    'text-slate-800',
                    'flex',
                    'items-center',
                    'gap-1.5',
                    'pt-0.5',
                  )}
                >
                  <Users size={12} className="text-slate-400" />
                  <span>
                    {selectedDetailsRental?.product?.owner?.name ||
                      'Vastu Host'}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    'font-medium',
                    'text-slate-400',
                    'block',
                    'truncate',
                  )}
                >
                  Ahmedabad, India
                </span>
              </div>

              <div
                className={cn(
                  'bg-white',
                  'p-4',
                  'rounded-2xl',
                  'border',
                  'border-slate-100/80',
                  'space-y-1',
                )}
              >
                <span
                  className={cn(
                    'text-[8px]',
                    'font-black',
                    'text-slate-400',
                    'uppercase',
                    'tracking-widest',
                    'block',
                  )}
                >
                  Booking Status
                </span>
                <div
                  className={cn('flex', 'gap-1.5', 'items-center', 'pt-0.5')}
                >
                  {selectedDetailsRental &&
                    getStatusBadge(selectedDetailsRental.status)}
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    'font-extrabold',
                    'uppercase',
                    'text-slate-400',
                    'block',
                    'tracking-tight',
                    'pt-1',
                  )}
                >
                  ID: #BK{selectedDetailsRental?.id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* OTP Verification Section (if booking is pending, confirmed, or ongoing) */}
            {selectedDetailsRental &&
              (selectedDetailsRental.status === 'pending' ||
                selectedDetailsRental.status === 'confirmed' ||
                selectedDetailsRental.status === 'picked_up' ||
                selectedDetailsRental.status === 'in_use') && (
                <div
                  className={cn(
                    'bg-[#fcfdfa]',
                    'p-4.5',
                    'rounded-2xl',
                    'border',
                    'border-[#e2edd8]',
                    'space-y-2',
                  )}
                >
                  <span
                    className={cn(
                      'text-[8px]',
                      'font-black',
                      'text-[#2d5222]',
                      'uppercase',
                      'tracking-widest',
                      'block',
                    )}
                  >
                    🛡️ Verification Security OTP
                  </span>
                  <div
                    className={cn('flex', 'items-center', 'justify-between')}
                  >
                    <div>
                      <p
                        className={cn('text-xs', 'font-bold', 'text-slate-700')}
                      >
                        {selectedDetailsRental.status === 'pending' ||
                        selectedDetailsRental.status === 'confirmed'
                          ? 'Pickup Verification OTP'
                          : 'Return Verification OTP'}
                      </p>
                      <p
                        className={cn(
                          'text-[10px]',
                          'text-slate-400',
                          'font-medium',
                          'mt-0.5',
                        )}
                      >
                        Share this OTP with the host upon physical verification.
                      </p>
                    </div>
                    <div
                      className={cn(
                        'bg-[#2d5222]/5',
                        'border',
                        'border-[#2d5222]/20',
                        'px-3.5',
                        'py-1.5',
                        'rounded-xl',
                        'font-mono',
                        'font-black',
                        'text-sm',
                        'text-[#2d5222]',
                      )}
                    >
                      {selectedDetailsRental.status === 'pending' ||
                      selectedDetailsRental.status === 'confirmed'
                        ? selectedDetailsRental.pickupOTP || '123456'
                        : selectedDetailsRental.returnOTP || '654321'}
                    </div>
                  </div>
                </div>
              )}

            {/* Booking dates and rental duration info */}
            <div
              className={cn(
                'bg-white',
                'p-4.5',
                'rounded-2xl',
                'border',
                'border-slate-100/80',
                'space-y-3',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-slate-400',
                  'uppercase',
                  'tracking-widest',
                  'block',
                )}
              >
                Rental Period
              </span>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-between',
                  'text-xs',
                  'font-bold',
                  'text-slate-700',
                )}
              >
                <div className={cn('flex', 'flex-col')}>
                  <span
                    className={cn('text-[9px]', 'text-slate-400', 'uppercase')}
                  >
                    From
                  </span>
                  <span className="mt-0.5">
                    {selectedDetailsRental?.startDate &&
                      format(
                        new Date(selectedDetailsRental.startDate),
                        'dd MMM yyyy',
                      )}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className={cn('text-slate-300', 'mt-2')}
                />
                <div className={cn('flex', 'flex-col', 'text-right')}>
                  <span
                    className={cn('text-[9px]', 'text-slate-400', 'uppercase')}
                  >
                    To
                  </span>
                  <span className="mt-0.5">
                    {selectedDetailsRental?.endDate &&
                      format(
                        new Date(selectedDetailsRental.endDate),
                        'dd MMM yyyy',
                      )}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'border-t',
                  'border-slate-50',
                  'pt-2.5',
                  'flex',
                  'items-center',
                  'justify-between',
                  'text-[11px]',
                  'font-bold',
                  'text-slate-500',
                )}
              >
                <span>Total Duration</span>
                <span className={cn('text-[#2d5222]', 'font-black')}>
                  {selectedDetailsRental?.startDate &&
                    selectedDetailsRental?.endDate &&
                    Math.max(
                      1,
                      Math.ceil(
                        (new Date(selectedDetailsRental.endDate).getTime() -
                          new Date(selectedDetailsRental.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}{' '}
                  Nights
                </span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div
              className={cn(
                'bg-white',
                'p-4.5',
                'rounded-2xl',
                'border',
                'border-slate-100/80',
                'space-y-2',
                'text-xs',
                'font-semibold',
                'text-slate-500',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-slate-400',
                  'uppercase',
                  'tracking-widest',
                  'block',
                  'mb-1',
                )}
              >
                Payment & Billing Details
              </span>
              <div className={cn('flex', 'justify-between')}>
                <span>Daily Rent Rate</span>
                <span className={cn('text-slate-800', 'font-bold')}>
                  ₹{selectedDetailsRental?.product?.price?.toLocaleString()}
                </span>
              </div>
              <div className={cn('flex', 'justify-between')}>
                <span>Rental Fee</span>
                <span className={cn('text-slate-800', 'font-bold')}>
                  ₹{selectedDetailsRental?.rentalFee?.toLocaleString()}
                </span>
              </div>
              <div className={cn('flex', 'justify-between')}>
                <span>Refundable Security Deposit</span>
                <span className={cn('text-slate-800', 'font-bold')}>
                  ₹
                  {selectedDetailsRental?.depositAmount?.toLocaleString() ||
                    '₹0'}
                </span>
              </div>
              {selectedDetailsRental?.coupon && (
                <div
                  className={cn(
                    'flex',
                    'justify-between',
                    'text-emerald-600',
                    'font-bold',
                  )}
                >
                  <span>
                    Coupon Discount ({selectedDetailsRental.coupon.code})
                  </span>
                  <span>
                    - ₹
                    {(
                      selectedDetailsRental.rentalFee +
                      selectedDetailsRental.depositAmount -
                      selectedDetailsRental.totalPrice
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'flex',
                  'justify-between',
                  'text-[13px]',
                  'font-black',
                  'text-[#2d5222]',
                  'border-t',
                  'border-slate-50',
                  'pt-2.5',
                )}
              >
                <span>Total Amount Paid</span>
                <span className={cn('flex', 'items-center')}>
                  <IndianRupee size={12} className="stroke-[3]" />
                  {selectedDetailsRental?.totalPrice?.toLocaleString()}
                </span>
              </div>
              <div
                className={cn(
                  'flex',
                  'justify-between',
                  'items-center',
                  'text-[10px]',
                  'text-slate-400',
                  'font-bold',
                  'pt-1.5',
                )}
              >
                <span>
                  Payment Mode:{' '}
                  <span className={cn('text-slate-500', 'uppercase')}>
                    {selectedDetailsRental?.paymentMethod === 'cash'
                      ? 'Cash/COD'
                      : 'Online Payment'}
                  </span>
                </span>
                <span>
                  Payment Status:{' '}
                  <span
                    className={cn(
                      'uppercase',
                      selectedDetailsRental?.paymentStatus === 'paid'
                        ? 'text-emerald-600'
                        : 'text-amber-600',
                    )}
                  >
                    {selectedDetailsRental?.paymentStatus || 'Pending'}
                  </span>
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsDetailsDialogOpen(false)}
              className={cn(
                'w-full',
                'h-11',
                'rounded-2xl',
                'bg-[#2d5222]',
                'hover:bg-[#1e3816]',
                'text-white',
                'font-extrabold',
                'text-xs',
                'shadow-sm',
                'active:scale-98',
                'transition-all',
                'cursor-pointer',
              )}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Write Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-[480px]',
            'bg-white',
            'rounded-3xl',
            'p-6',
            'border',
            'border-slate-100',
            'shadow-xl',
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn('text-xl', 'font-bold', 'text-gray-900')}
            >
              Write a Review for {selectedRental?.product?.title}
            </DialogTitle>
          </DialogHeader>

          <div className={cn('space-y-6', 'py-4')}>
            {/* Rating Stars Input */}
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-gray-700')}
              >
                Rating
              </label>
              <div className={cn('flex', 'items-center', 'gap-1.5')}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      'p-1',
                      'transition-transform',
                      'active:scale-90',
                      'cursor-pointer',
                    )}
                  >
                    <Star
                      size={28}
                      className={cn(
                        'stroke-[2]',
                        star <= rating
                          ? 'text-[#2d5222] fill-[#2d5222]'
                          : 'text-slate-200 fill-transparent',
                      )}
                    />
                  </button>
                ))}
                <span
                  className={cn(
                    'text-sm',
                    'font-bold',
                    'text-slate-400',
                    'ml-2',
                  )}
                >
                  ({rating}.0 / 5.0)
                </span>
              </div>
            </div>

            {/* Review Comment Input */}
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-gray-700')}
              >
                Comment
              </label>
              <Textarea
                placeholder="Product quality was very good. Sturdy and easy to use..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={cn(
                  'rounded-xl',
                  'border-slate-200',
                  'min-h-[100px]',
                  'text-sm',
                  'focus-visible:ring-[#2d5222]',
                )}
              />
            </div>

            {/* Review Images Option (Optional) */}
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-gray-700')}
              >
                Review Images (Optional)
              </label>
              <div className={cn('flex', 'flex-wrap', 'gap-3', 'items-center')}>
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative',
                      'w-16',
                      'h-16',
                      'rounded-xl',
                      'overflow-hidden',
                      'border',
                      'border-slate-100',
                      'bg-slate-50',
                    )}
                  >
                    <img
                      src={img}
                      className={cn('w-full', 'h-full', 'object-cover')}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedImages((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className={cn(
                        'absolute',
                        'top-1',
                        'right-1',
                        'bg-red-500',
                        'text-white',
                        'rounded-full',
                        'p-0.5',
                        'hover:bg-red-600',
                        'transition-colors',
                        'w-4',
                        'h-4',
                        'flex',
                        'items-center',
                        'justify-center',
                        'text-[9px]',
                        'font-bold',
                      )}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 3 && (
                  <label
                    className={cn(
                      'w-16 h-16 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-[#2d5222] hover:border-[#2d5222] transition-colors cursor-pointer text-[10px] font-bold gap-1',
                      isUploading && 'opacity-50 pointer-events-none',
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          setIsUploading(true)
                          const formData = new FormData()
                          formData.append('file', file)
                          const res = await apiClient.post(
                            '/upload/product',
                            formData,
                            {
                              headers: {
                                'Content-Type': 'multipart/form-data',
                              },
                            },
                          )
                          if (res.data.url) {
                            setUploadedImages((prev) => [...prev, res.data.url])
                          }
                        } catch (err) {
                          toast.error('Image upload failed.')
                        } finally {
                          setIsUploading(false)
                        }
                      }}
                    />
                    {isUploading ? '...' : '+ Add'}
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className={cn('flex', 'gap-2', 'sm:justify-end')}>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              className={cn('rounded-xl', 'border-slate-200', 'font-semibold')}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!comment.trim()) {
                  toast.error('Please enter a comment.')
                  return
                }
                // Append images markdown/text to the comment since Prisma has no images field on reviews
                let finalComment = comment
                if (uploadedImages.length > 0) {
                  finalComment += `\n\n[Images: ${uploadedImages.join(', ')}]`
                }
                reviewMutation.mutate({
                  productId: selectedRental.productId,
                  rating,
                  comment: finalComment,
                })
              }}
              disabled={reviewMutation.isPending}
              className={cn(
                'rounded-xl',
                'bg-[#2d5222]',
                'hover:bg-[#1e3816]',
                'text-white',
                'font-semibold',
              )}
            >
              {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
