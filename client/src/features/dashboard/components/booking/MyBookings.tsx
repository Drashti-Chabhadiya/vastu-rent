import { useMyRentals, useCreateDispute } from '#/hook'
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
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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

  // Dispute states
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const disputeMutation = useCreateDispute()

  const handleCreateDispute = () => {
    if (!selectedRental || !disputeReason || !disputeDescription.trim()) return

    disputeMutation.mutate(
      {
        rentalId: selectedRental.id,
        reason: disputeReason,
        description: disputeDescription,
      },
      {
        onSuccess: () => {
          toast.success(
            'Dispute reported successfully! Vastu Support is reviewing it.',
          )
          setIsDisputeDialogOpen(false)
          setDisputeReason('')
          setDisputeDescription('')
          setSelectedRental(null)
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              'Failed to submit dispute. Try again.',
          )
        },
      },
    )
  }

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
            <div className={cn('h-8', 'bg-muted', 'rounded-full', 'w-48')} />
            <div className={cn('h-4', 'bg-muted/50', 'rounded-full', 'w-80')} />
          </div>
          <div className={cn('h-10', 'bg-muted', 'rounded-full', 'w-24')} />
        </div>
        {/* Tabs Skeleton */}
        <div
          className={cn(
            'flex',
            'gap-6',
            'border-b',
            'border-border/30',
            'pb-2',
          )}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn('h-5', 'bg-muted', 'rounded-full', 'w-20')}
            />
          ))}
        </div>
        {/* List Skeleton */}
        <div className={cn('grid', 'gap-4')}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-card',
                'p-6',
                'rounded-[2.5rem]',
                'border',
                'border-border/30',
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
                  'bg-muted/50',
                  'shrink-0',
                )}
              />
              <div className={cn('flex-1', 'space-y-3')}>
                <div
                  className={cn('h-5', 'bg-muted', 'rounded-full', 'w-48')}
                />
                <div
                  className={cn(
                    'h-4',
                    'bg-muted-light/80',
                    'rounded-full',
                    'w-32',
                  )}
                />
                <div
                  className={cn(
                    'h-4',
                    'bg-muted/50',
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
                  className={cn('h-4', 'bg-muted', 'rounded-full', 'w-24')}
                />
                <div
                  className={cn('h-5', 'bg-muted', 'rounded-full', 'w-32')}
                />
                <div
                  className={cn(
                    'h-9',
                    'bg-muted-light/80',
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
              'bg-warning/25',
              'hover:bg-warning/25',
              'text-warning-foreground',
              'border-none',
              'px-3.5',
              'py-1',
              'rounded-full',
              'font-bold',
              'text-xs',
              'shrink-0',
              'shadow-sm',
              'shadow-warning-foreground/5',
            )}
          >
            Upcoming
          </Badge>
        )
      case 'ongoing':
        return (
          <Badge
            className={cn(
              'bg-info/25',
              'hover:bg-info/25',
              'text-info-foreground',
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
              'bg-primary-soft',
              'hover:bg-primary-soft',
              'text-primary',
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
              'bg-danger',
              'hover:bg-danger',
              'text-danger-foreground',
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
              'text-foreground',
              'tracking-tight',
            )}
          >
            My Bookings
          </h1>
          <p className={cn('text-sm', 'text-muted-foreground/70', 'font-bold')}>
            Manage your upcoming and past bookings.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full',
                'border-border',
                'text-foreground/80',
                'font-bold',
                'h-10',
                'px-5',
                'flex',
                'items-center',
                'gap-2',
                'hover:bg-muted-light/50',
                'shadow-sm',
                'shrink-0',
                'cursor-pointer',
              )}
            >
              <SlidersHorizontal size={14} className="text-muted-dark" />
              {paymentFilter === 'all'
                ? 'Filter'
                : paymentFilter === 'paid'
                  ? 'Paid Bookings'
                  : 'Unpaid Bookings'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              'bg-card',
              'border-border/30/80',
              'rounded-xl',
              'shadow-lg',
              'p-1',
              'min-w-[160px]',
            )}
          >
            <DropdownMenuItem
              onClick={() => setPaymentFilter('all')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                paymentFilter === 'all' && 'text-primary bg-primary/5',
              )}
            >
              All Payments
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('paid')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                paymentFilter === 'paid' && 'text-primary bg-primary/5',
              )}
            >
              Paid Bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('pending')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                paymentFilter === 'pending' && 'text-primary bg-primary/5',
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
          'border-border/30',
          'pb-px',
          'overflow-x-auto',
          'custom-scrollbar',
        )}
      >
        {(['upcoming', 'ongoing', 'completed', 'cancelled'] as const).map(
          (tab) => {
            const isActive = activeTab === tab
            return (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-3 font-extrabold text-[13px] capitalize transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-dark hover:text-muted-foreground',
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
                      'bg-primary',
                      'rounded-full',
                    )}
                  />
                )}
              </Button>
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
            'bg-card',
            'rounded-[2.5rem]',
            'border',
            'border-dashed',
            'border-border',
          )}
        >
          <div
            className={cn(
              'w-16',
              'h-16',
              'bg-muted-light',
              'rounded-full',
              'flex',
              'items-center',
              'justify-center',
              'mb-4',
            )}
          >
            <Calendar className="text-muted-dark" size={32} />
          </div>
          <h3 className={cn('text-lg', 'font-extrabold', 'text-foreground/90')}>
            No {activeTab} bookings
          </h3>
          <p
            className={cn(
              'text-muted-dark',
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
                  'bg-card',
                  'p-6',
                  'rounded-[2.5rem]',
                  'border',
                  'border-border/30',
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
                    'bg-muted-light',
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
                        'text-foreground',
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
                        'text-muted-dark',
                        'mt-1',
                      )}
                    >
                      <MapPin size={12} className="text-primary" />
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
                        'text-muted-foreground/85',
                      )}
                    >
                      <Calendar size={13} className="text-muted-dark" />
                      <span>
                        {format(new Date(rental.startDate), 'dd MMMM')} –{' '}
                        {format(new Date(rental.endDate), 'dd MMMM, yyyy')}{' '}
                        <span className="text-muted-dark">
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
                        'text-muted-foreground/85',
                      )}
                    >
                      <Users size={13} className="text-muted-dark" />
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
                    'border-border/30',
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
                        'text-muted-dark',
                        'font-extrabold',
                        'uppercase',
                        'tracking-wider',
                      )}
                    >
                      Booking ID:{' '}
                      <span
                        className={cn('font-mono', 'text-muted-foreground/85')}
                      >
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
                        'text-muted-foreground/85',
                        'mt-1',
                      )}
                    >
                      <span className={cn('text-muted-dark', 'font-extrabold')}>
                        Total Amount
                      </span>
                      <span
                        className={cn(
                          'text-base',
                          'font-black',
                          'text-foreground',
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
                                'text-primary',
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
                                className="text-primary"
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
                                      'text-primary',
                                      'font-black',
                                      'text-[11px]',
                                      'px-3.5',
                                      'h-8',
                                      'flex',
                                      'items-center',
                                      'justify-center',
                                      'border',
                                      'border-primary/15',
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
                              'bg-primary',
                              'hover:bg-primary-hover',
                              'text-primary-foreground',
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

                    {getBookingGroup(rental.status) !== 'cancelled' && (
                      <Button
                        onClick={() => {
                          setSelectedRental(rental)
                          setIsDisputeDialogOpen(true)
                        }}
                        variant="outline"
                        className={cn(
                          'rounded-full',
                          'border-danger/30',
                          'text-danger-foreground',
                          'hover:bg-danger/10',
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
                        Report Dispute
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDetailsRental(rental)
                        setIsDetailsDialogOpen(true)
                      }}
                      className={cn(
                        'rounded-full',
                        'border-border',
                        'text-primary',
                        'font-black',
                        'text-xs',
                        'px-4',
                        'h-9',
                        'flex',
                        'items-center',
                        'gap-1',
                        'hover:bg-muted-light/50',
                        'shadow-sm',
                        'active:scale-95',
                        'cursor-pointer',
                      )}
                    >
                      View Details
                      <ChevronRight
                        size={14}
                        className={cn('text-primary', 'stroke-[3]')}
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
          'bg-background',
          'rounded-[2.5rem]',
          'border',
          'border-border/30',
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
              'bg-primary-soft',
              'flex',
              'items-center',
              'justify-center',
              'text-primary',
              'shrink-0',
              'border',
              'border-primary-border',
            )}
          >
            <HelpCircle size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className={cn('font-extrabold', 'text-foreground', 'text-sm')}>
              Need help with your booking?
            </h4>
            <p
              className={cn(
                'text-muted-dark',
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
            'border-border',
            'text-foreground/80',
            'font-black',
            'px-6',
            'h-10',
            'flex',
            'items-center',
            'gap-1.5',
            'hover:bg-muted-light',
            'shadow-sm',
            'cursor-pointer',
          )}
        >
          <MessageSquare
            size={15}
            className={cn('text-muted-dark', 'shrink-0')}
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
            'bg-muted-light',
            'rounded-[2.5rem]',
            'shadow-2xl',
            'font-sans',
            'overflow-hidden',
          )}
        >
          {/* Top Product Banner card */}
          <div className={cn('relative', 'h-44', 'bg-foreground')}>
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
                    'text-primary',
                    'bg-primary-soft',
                    'px-2',
                    'py-1',
                    'rounded-md',
                    'border',
                    'border-primary-border',
                  )}
                >
                  {selectedDetailsRental?.product?.category?.name ||
                    'Vastu Rental'}
                </span>
                <h3
                  className={cn(
                    'text-xl',
                    'font-extrabold',
                    'text-primary-foreground',
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
                  'bg-card',
                  'p-4',
                  'rounded-2xl',
                  'border',
                  'border-border/30/80',
                  'space-y-1',
                )}
              >
                <span
                  className={cn(
                    'text-[8px]',
                    'font-black',
                    'text-muted-dark',
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
                    'text-foreground/90',
                    'flex',
                    'items-center',
                    'gap-1.5',
                    'pt-0.5',
                  )}
                >
                  <Users size={12} className="text-muted-dark" />
                  <span>
                    {selectedDetailsRental?.product?.owner?.name ||
                      'Vastu Host'}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    'font-medium',
                    'text-muted-dark',
                    'block',
                    'truncate',
                  )}
                >
                  Ahmedabad, India
                </span>
              </div>

              <div
                className={cn(
                  'bg-card',
                  'p-4',
                  'rounded-2xl',
                  'border',
                  'border-border/30/80',
                  'space-y-1',
                )}
              >
                <span
                  className={cn(
                    'text-[8px]',
                    'font-black',
                    'text-muted-dark',
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
                    'text-muted-dark',
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
                    'border-primary-border',
                    'space-y-2',
                  )}
                >
                  <span
                    className={cn(
                      'text-[8px]',
                      'font-black',
                      'text-primary',
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
                        className={cn(
                          'text-xs',
                          'font-bold',
                          'text-foreground/80',
                        )}
                      >
                        {selectedDetailsRental.status === 'pending' ||
                        selectedDetailsRental.status === 'confirmed'
                          ? 'Pickup Verification OTP'
                          : 'Return Verification OTP'}
                      </p>
                      <p
                        className={cn(
                          'text-[10px]',
                          'text-muted-dark',
                          'font-medium',
                          'mt-0.5',
                        )}
                      >
                        Share this OTP with the host upon physical verification.
                      </p>
                    </div>
                    <div
                      className={cn(
                        'bg-primary/5',
                        'border',
                        'border-primary/20',
                        'px-3.5',
                        'py-1.5',
                        'rounded-xl',
                        'font-mono',
                        'font-black',
                        'text-sm',
                        'text-primary',
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
                'bg-card',
                'p-4.5',
                'rounded-2xl',
                'border',
                'border-border/30/80',
                'space-y-3',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-muted-dark',
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
                  'text-foreground/80',
                )}
              >
                <div className={cn('flex', 'flex-col')}>
                  <span
                    className={cn('text-[9px]', 'text-muted-dark', 'uppercase')}
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
                  className={cn('text-muted-dark', 'mt-2')}
                />
                <div className={cn('flex', 'flex-col', 'text-right')}>
                  <span
                    className={cn('text-[9px]', 'text-muted-dark', 'uppercase')}
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
                  'border-border/30',
                  'pt-2.5',
                  'flex',
                  'items-center',
                  'justify-between',
                  'text-[11px]',
                  'font-bold',
                  'text-muted-foreground/85',
                )}
              >
                <span>Total Duration</span>
                <span className={cn('text-primary', 'font-black')}>
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
                'bg-card',
                'p-4.5',
                'rounded-2xl',
                'border',
                'border-border/30/80',
                'space-y-2',
                'text-xs',
                'font-semibold',
                'text-muted-foreground/85',
              )}
            >
              <span
                className={cn(
                  'text-[8px]',
                  'font-black',
                  'text-muted-dark',
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
                <span className={cn('text-foreground/90', 'font-bold')}>
                  ₹{selectedDetailsRental?.product?.price?.toLocaleString()}
                </span>
              </div>
              <div className={cn('flex', 'justify-between')}>
                <span>Rental Fee</span>
                <span className={cn('text-foreground/90', 'font-bold')}>
                  ₹{selectedDetailsRental?.rentalFee?.toLocaleString()}
                </span>
              </div>
              <div className={cn('flex', 'justify-between')}>
                <span>Refundable Security Deposit</span>
                <span className={cn('text-foreground/90', 'font-bold')}>
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
                  'text-primary',
                  'border-t',
                  'border-border/30',
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
                  'text-muted-dark',
                  'font-bold',
                  'pt-1.5',
                )}
              >
                <span>
                  Payment Mode:{' '}
                  <span className={cn('text-muted-foreground/85', 'uppercase')}>
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
                        : 'text-warning-foreground',
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
                'bg-primary',
                'hover:bg-primary-hover',
                'text-primary-foreground',
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
            'bg-card',
            'rounded-3xl',
            'p-6',
            'border',
            'border-border/30',
            'shadow-xl',
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn('text-xl', 'font-bold', 'text-foreground')}
            >
              Write a Review for {selectedRental?.product?.title}
            </DialogTitle>
          </DialogHeader>

          <div className={cn('space-y-6', 'py-4')}>
            {/* Rating Stars Input */}
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
              >
                Rating
              </label>
              <div className={cn('flex', 'items-center', 'gap-1.5')}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRating(star)}
                    className={cn(
                      'p-1',
                      'transition-transform',
                      'active:scale-90',
                      'cursor-pointer',
                      'h-auto w-auto',
                      'hover:bg-transparent',
                    )}
                  >
                    <Star
                      size={28}
                      className={cn(
                        'stroke-[2]',
                        star <= rating
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground/30 fill-transparent',
                      )}
                    />
                  </Button>
                ))}
                <span
                  className={cn(
                    'text-sm',
                    'font-bold',
                    'text-muted-dark',
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
                className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
              >
                Comment
              </label>
              <Textarea
                placeholder="Product quality was very good. Sturdy and easy to use..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={cn(
                  'rounded-xl',
                  'border-border',
                  'min-h-[100px]',
                  'text-sm',
                  'focus-visible:ring-primary',
                )}
              />
            </div>

            {/* Review Images Option (Optional) */}
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
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
                      'border-border/30',
                      'bg-muted-light',
                    )}
                  >
                    <img
                      src={img}
                      className={cn('w-full', 'h-full', 'object-cover')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        setUploadedImages((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className={cn(
                        'absolute',
                        'top-1',
                        'right-1',
                        'rounded-full',
                        'w-4',
                        'h-4',
                        'flex',
                        'items-center',
                        'justify-center',
                        'text-[9px]',
                        'font-bold',
                        'p-0',
                      )}
                    >
                      ×
                    </Button>
                  </div>
                ))}

                {uploadedImages.length < 3 && (
                  <label
                    className={cn(
                      'w-16 h-16 rounded-xl border border-dashed border-border/120 flex flex-col items-center justify-center text-muted-dark hover:text-primary hover:border-primary transition-colors cursor-pointer text-[10px] font-bold gap-1',
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
              className={cn('rounded-xl', 'border-border', 'font-semibold')}
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
                'bg-primary',
                'hover:bg-primary-hover',
                'text-primary-foreground',
                'font-semibold',
              )}
            >
              {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-[480px]',
            'bg-card',
            'rounded-3xl',
            'p-6',
            'border',
            'border-border/30',
            'shadow-xl',
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn('text-xl', 'font-bold', 'text-foreground')}
            >
              Report Dispute for {selectedRental?.product?.title || 'Rental'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              If you have experienced an issue with this booking, please select
              a reason and describe it. Vastu Support will review your report.
            </DialogDescription>
          </DialogHeader>

          <div className={cn('space-y-4', 'py-4')}>
            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
              >
                Reason for Dispute
              </label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger className="w-full rounded-xl border-border bg-background">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/30 rounded-xl">
                  <SelectItem value="Item damaged or not working">
                    Item damaged or not working
                  </SelectItem>
                  <SelectItem value="Item not as described">
                    Item not as described
                  </SelectItem>
                  <SelectItem value="Host did not show up / unavailable">
                    Host did not show up / unavailable
                  </SelectItem>
                  <SelectItem value="Billing or pricing issue">
                    Billing or pricing issue
                  </SelectItem>
                  <SelectItem value="Security deposit dispute">
                    Security deposit dispute
                  </SelectItem>
                  <SelectItem value="Late return / pickup dispute">
                    Late return / pickup dispute
                  </SelectItem>
                  <SelectItem value="Other operational issues">
                    Other operational issues
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
              >
                Detailed Description
              </label>
              <Textarea
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Provide details about the issue. Be as specific as possible so our support team can resolve it fairly."
                className="min-h-[120px] rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className={cn('flex', 'gap-2', 'sm:justify-end')}>
            <Button
              variant="outline"
              onClick={() => {
                setIsDisputeDialogOpen(false)
                setDisputeReason('')
                setDisputeDescription('')
                setSelectedRental(null)
              }}
              className={cn('rounded-xl', 'border-border', 'font-semibold')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDispute}
              disabled={
                disputeMutation.isPending ||
                !disputeReason ||
                !disputeDescription.trim()
              }
              className={cn(
                'rounded-xl',
                'bg-primary',
                'hover:bg-primary-hover',
                'text-primary-foreground',
                'font-semibold',
              )}
            >
              {disputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
