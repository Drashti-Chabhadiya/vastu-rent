import {
  useMyRentals,
  useCreateDispute,
  useCreateReview,
  useVerifyBookingSession,
} from '#/hook'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { LoadingOverlay } from '#/components/ui/loader'
import { useTranslation } from '#/context/TranslationContext'
import { BookingCard } from './components/BookingCard'
import { BookingDetailsDialog } from './components/BookingDetailsDialog'
import { ReviewDialog } from './components/ReviewDialog'
import { DisputeDialog } from './components/DisputeDialog'
import { getBookingGroup } from '#/lib/booking-utils'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { MyBookingsFilterDropdown } from './components/MyBookingsFilterDropdown'
import { MyBookingsTabs } from './components/MyBookingsTabs'
import { MyBookingsEmptyState } from './components/MyBookingsEmptyState'
import { HelpBanner } from './components/HelpBanner'
import { MyBookingsSkeleton } from '#/components/skeletons'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

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

  const [selectedRental, setSelectedRental] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const [selectedDetailsRental, setSelectedDetailsRental] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

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
    return <MyBookingsSkeleton />
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

  // Group bookings by month for mobile display
  const groupedByMonth = filteredRentals.reduce(
    (acc: Record<string, any[]>, rental: any) => {
      const monthKey = format(new Date(rental.startDate), 'MMMM yyyy')
      if (!acc[monthKey]) acc[monthKey] = []
      acc[monthKey].push(rental)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 md:space-y-8 relative"
    >
      {isVerifying && (
        <LoadingOverlay
          message={t('Verifying payment...')}
          className="rounded-[32px] z-50 animate-fade-in"
        />
      )}
      <motion.div
        variants={fadeUp}
        className="flex flex-row justify-between items-center gap-4"
      >
        <div className="flex items-center gap-3">
          {/* Mobile inline back button */}
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-brand-beige/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-brand-beige/75 shrink-0 transition-colors lg:hidden"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-foreground tracking-tight">
              {t('My Bookings')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground/70 font-bold hidden sm:block">
              {t('Manage your upcoming and past bookings.')}
            </p>
          </div>
        </div>
        <MyBookingsFilterDropdown
          paymentFilter={paymentFilter}
          onFilterChange={setPaymentFilter}
        />
      </motion.div>

      <MyBookingsTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      {filteredRentals.length === 0 ? (
        <MyBookingsEmptyState activeTab={activeTab} />
      ) : (
        <>
          {/* MOBILE: grouped by month */}
          <motion.div
            key={`mobile-${activeTab}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-0 md:hidden"
          >
            {(Object.entries(groupedByMonth) as [string, any[]][]).map(([month, monthRentals]) => (
              <motion.div key={month} variants={fadeUp} className="mb-4">
                {/* Month header */}
                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mb-3 px-0.5">
                  {month.toUpperCase()}
                </p>
                <div className="flex flex-col gap-3">
                  {monthRentals.map((rental: any) => (
                    <BookingCard
                      key={rental.id}
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
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Footer label */}
            <div className="text-center py-4 text-[10px] text-muted-foreground/50 font-black">
              — {t("that's all for now")} —
            </div>
          </motion.div>

          {/* DESKTOP: flat grid */}
          <motion.div
            key={`desktop-${activeTab}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="hidden md:grid gap-5"
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
        </>
      )}

      <HelpBanner />

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
