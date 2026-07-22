import {
  useMyRentals,
  useCreateDispute,
  useCreateReview,
  useVerifyBookingSession,
} from '#/hook'
import {
  Calendar,
  SlidersHorizontal,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { LoadingOverlay } from '#/components/ui/loader'
import { useTranslation } from '#/context/TranslationContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { BookingCard } from './components/BookingCard'
import { BookingDetailsDialog } from './components/BookingDetailsDialog'
import { ReviewDialog } from './components/ReviewDialog'
import { DisputeDialog } from './components/DisputeDialog'
import { getBookingGroup } from '#/lib/booking-utils'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export const MyBookings = () => {
  const { data: rentals, isLoading, refetch } = useMyRentals()
  const { t } = useTranslation()
  const [isVerifying, setIsVerifying] = useState(false)
  const verifyBookingSession = useVerifyBookingSession()
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  >('upcoming')
  const [paymentFilter, setPaymentFilter] = useState<
    'all' | 'paid' | 'pending'
  >('all')

  // Verify Stripe Checkout session on mount/redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const rentalId = params.get('rental_id')

    if (sessionId && rentalId) {
      const verifySession = async () => {
        setIsVerifying(true)
        const toastId = toast.loading(t('Verifying your booking payment...'))
        try {
          const res = await verifyBookingSession.mutateAsync({
            sessionId,
            rentalId,
          })
          if (res?.success) {
            toast.success(t('🎉 Booking confirmed and paid successfully!'), {
              id: toastId,
            })
            await refetch()
            // Clean up query parameters in URL without page refresh
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            )
          } else {
            toast.error(t('Could not verify your booking payment.'), {
              id: toastId,
            })
          }
        } catch (error: any) {
          console.error('Booking session verification failed:', error)
          toast.error(
            error.response?.data?.message ||
              t('Booking payment verification failed.'),
            { id: toastId },
          )
        } finally {
          setIsVerifying(false)
        }
      }
      verifySession()
    }
  }, [refetch])

  // Review state
  const [selectedRental, setSelectedRental] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // Booking details state
  const [selectedDetailsRental, setSelectedDetailsRental] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Dispute state
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const disputeMutation = useCreateDispute()

  const reviewMutation = useCreateReview()

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
            t('Dispute reported successfully! Vastu Support is reviewing it.'),
          )
          setIsDisputeDialogOpen(false)
          setDisputeReason('')
          setDisputeDescription('')
          setSelectedRental(null)
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              t('Failed to submit dispute. Try again.'),
          )
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-8', 'animate-pulse')}>
        <div className={cn('flex', 'justify-between', 'items-center')}>
          <div className="space-y-2">
            <div className={cn('h-8', 'bg-muted', 'rounded-full', 'w-48')} />
            <div className={cn('h-4', 'bg-muted/50', 'rounded-full', 'w-80')} />
          </div>
          <div className={cn('h-10', 'bg-muted', 'rounded-full', 'w-24')} />
        </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

  const filteredRentals =
    rentals?.filter((r: any) => {
      if (getBookingGroup(r.status) !== activeTab) return false
      if (paymentFilter !== 'all' && r.paymentStatus !== paymentFilter)
        return false
      return true
    }) || []

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >
      {isVerifying && (
        <LoadingOverlay
          message={t('Verifying payment...')}
          className="rounded-[32px] z-50 animate-fade-in"
        />
      )}
      {/* Header */}
      <motion.div
        variants={fadeUp}
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
            {t('My Bookings')}
          </h1>
          <p className={cn('text-sm', 'text-muted-foreground/70', 'font-bold')}>
            {t('Manage your upcoming and past bookings.')}
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
                ? t('Filter')
                : paymentFilter === 'paid'
                  ? t('Paid Bookings')
                  : t('Unpaid Bookings')}
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
              {t('All Payments')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('paid')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                paymentFilter === 'paid' && 'text-primary bg-primary/5',
              )}
            >
              {t('Paid Bookings')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPaymentFilter('pending')}
              className={cn(
                'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
                paymentFilter === 'pending' && 'text-primary bg-primary/5',
              )}
            >
              {t('Pending Payment')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeUp}
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
                  {t(tab)} ({counts[tab]})
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
      </motion.div>

      {/* Bookings List */}
      {filteredRentals.length === 0 ? (
        <motion.div
          variants={fadeUp}
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
            {t('No')} {t(activeTab)} {t('bookings')}
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
            {t("You don't have any bookings matching this status right now.")}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          variants={stagger}
          initial="hidden"
          animate="show"
          className={cn('grid', 'gap-5')}
        >
          {filteredRentals.map((rental: any) => (
            <motion.div key={rental.id} variants={fadeUp}>
              <BookingCard
                rental={rental}
                onOpenReview={(r) => {
                  setSelectedRental(r)
                  const existingReview = r.product?.reviews?.[0]
                  if (existingReview) {
                    setRating(existingReview.rating)
                    setComment(
                      existingReview.comment
                        ? existingReview.comment.split('\n\n[Images:')[0]
                        : '',
                    )
                  } else {
                    setRating(5)
                    setComment('')
                  }
                  setIsReviewDialogOpen(true)
                }}
                onOpenDispute={(r) => {
                  setSelectedRental(r)
                  setIsDisputeDialogOpen(true)
                }}
                onOpenDetails={(r) => {
                  setSelectedDetailsRental(r)
                  setIsDetailsDialogOpen(true)
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Need Help Banner */}
      <motion.div
        variants={fadeUp}
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
              {t('Need help with your booking?')}
            </h4>
            <p
              className={cn(
                'text-muted-dark',
                'text-xs',
                'font-semibold',
                'mt-0.5',
              )}
            >
              {t('Our support team is here to assist you.')}
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
          {t('Contact Support')}
        </Button>
      </motion.div>

      {/* Dialogs */}
      <BookingDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        rental={selectedDetailsRental}
      />

      <ReviewDialog
        open={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        rental={selectedRental}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
        onSubmit={() => {
          if (!comment.trim()) {
            toast.error(t('Please enter a comment.'))
            return
          }
          let finalComment = comment
          if (uploadedImages.length > 0) {
            finalComment += `\n\n[Images: ${uploadedImages.join(', ')}]`
          }
          reviewMutation.mutate(
            {
              productId: selectedRental.productId,
              rating,
              comment: finalComment,
            },
            {
              onSuccess: () => {
                toast.success(t('Review submitted successfully!'))
                setIsReviewDialogOpen(false)
                setRating(5)
                setComment('')
                setUploadedImages([])
              },
              onError: () => {
                toast.error(t('Failed to submit review. Please try again.'))
              },
            },
          )
        }}
        isPending={reviewMutation.isPending}
      />

      <DisputeDialog
        open={isDisputeDialogOpen}
        onClose={() => {
          setIsDisputeDialogOpen(false)
          setDisputeReason('')
          setDisputeDescription('')
          setSelectedRental(null)
        }}
        rental={selectedRental}
        disputeReason={disputeReason}
        setDisputeReason={setDisputeReason}
        disputeDescription={disputeDescription}
        setDisputeDescription={setDisputeDescription}
        onSubmit={handleCreateDispute}
        isPending={disputeMutation.isPending}
      />
    </motion.div>
  )
}
