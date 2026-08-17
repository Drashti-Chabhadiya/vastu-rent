import { useNavigate } from '@tanstack/react-router'
import {
  useProduct,
  useWishlist,
  useCreateRental,
  useProductRentals,
  useApplyCoupon,
  useConfirmPayment,
  useCreateBookingSession,
  useCancelBookingSession,
} from '#/hook'
import { toast } from 'sonner'
import { Share } from '@capacitor/share'
import { useProductReviews, useCreateReview } from '#/hook/use-reviews'
import { ProductDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { AlertCircle } from 'lucide-react'
import { useSessionContext } from '#/context/SessionContext'
import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import { ProductBreadcrumbs } from './detail/ProductBreadcrumbs'
import { BookingConfirmationModal } from './detail/BookingConfirmationModal'
import { SimilarProducts } from './detail/SimilarProducts'
import { MobileBookingDrawer } from './detail/MobileBookingDrawer'
import { ProductMobileContent } from './detail/ProductMobileContent'
import { ProductDesktopContent } from './detail/ProductDesktopContent'
import { useProductBookingStore } from '../../../store/useProductBookingStore'

export function ProductDetail({ id }: { id: string }) {
  const { t, formatDate } = useTranslation()
  const navigate = useNavigate()
  const { data: session } = useSessionContext()
  const { data: product, isLoading, error } = useProduct(id)
  const { toggleLike, isLiked } = useWishlist()
  const { data: reviews = [] } = useProductReviews(id)
  const { data: productRentals = [] } = useProductRentals(id)
  const createRental = useCreateRental()
  const createReview = useCreateReview(id)
  const confirmPayment = useConfirmPayment()
  const createBookingSession = useCreateBookingSession()
  const cancelBookingSession = useCancelBookingSession()
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('reviews')

  // Calendar/Booking State from store
  const {
    calMonth,
    calYear,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showBookingConfirm,
    setShowBookingConfirm,
    setIsPaying,
    isPaying,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    setCouponError,
    resetBooking,
  } = useProductBookingStore()

  // Share state
  const [copied, setCopied] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  // Custom Alert State
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')

  const showAlert = useCallback((message: string, title = 'Notice') => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertOpen(true)
  }, [])

  const applyCoupon = useApplyCoupon()
  const today = new Date()

  // Reset booking when id changes
  useEffect(() => {
    resetBooking()
  }, [id, resetBooking])

  // Show error if payment was cancelled
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentCancelled = params.get('payment_cancelled') === 'true'
    const rentalId = params.get('rental_id')

    if (paymentCancelled) {
      toast.error('Payment was cancelled. You can try booking again.')
      if (rentalId) {
        cancelBookingSession.mutate({ rentalId })
      }
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [cancelBookingSession])

  // Reset coupon if dates change
  useEffect(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }, [startDate, endDate, setAppliedCoupon, setCouponCode, setCouponError])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    try {
      const result = await applyCoupon.mutateAsync({
        code: couponCode,
        totalPrice,
        productId: id,
      })
      setAppliedCoupon(result)
      setCouponError('')
    } catch (err: any) {
      setAppliedCoupon(null)
      setCouponError(err.response?.data?.message || 'Failed to apply coupon.')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleShare = useCallback(async () => {
    const title = product?.title || 'Vastu Rent'
    const text = `Check out this listing: ${product?.title || 'item'} on Vastu Rent!`
    const url = window.location.href

    try {
      const canShare = await Share.canShare()
      if (canShare.value) {
        await Share.share({ title, text, url, dialogTitle: 'Share Product' })
        return
      }
    } catch (e) {
      console.warn('Capacitor Share failed, falling back to Web Share API', e)
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        console.warn('Web Share failed', err)
      }
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(t('Product link copied to clipboard!'))
      setTimeout(() => setCopied(false), 2000)
    }
  }, [product, t])

  const handleDayClick = (day: number) => {
    const clicked = new Date(calYear, calMonth, day)

    // Check if clicked date is booked
    const isDateBooked = (date: Date) =>
      productRentals.some((r: any) => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)

        const s = new Date(r.startDate)
        s.setHours(0, 0, 0, 0)

        const e = new Date(r.endDate)
        e.setHours(0, 0, 0, 0)

        return d >= s && d <= e
      })

    if (isDateBooked(clicked)) return

    if (!startDate || endDate) {
      setStartDate(clicked)
      setEndDate(null)
    } else {
      // If selecting a range, check if any date in between is booked
      let hasBookedInRange = false

      const start = clicked < startDate ? clicked : startDate
      const end = clicked < startDate ? startDate : clicked

      const temp = new Date(start)

      while (temp <= end) {
        if (isDateBooked(temp)) {
          hasBookedInRange = true
          break
        }

        temp.setDate(temp.getDate() + 1)
      }

      if (hasBookedInRange) {
        showAlert(
          'This range includes dates that are already booked.',
          'Unavailable Dates',
        )
        setStartDate(clicked)
        setEndDate(null)
        return
      }

      if (clicked < startDate) {
        setEndDate(startDate)
        setStartDate(clicked)
      } else {
        setEndDate(clicked)
      }
    }
  }

  const handleSubmitReview = async () => {
    if (reviewComment.trim().length === 0) {
      setReviewError('Please write a comment')
      return
    }
    setReviewError('')
    try {
      await createReview.mutateAsync({
        rating: reviewRating,
        comment: reviewComment,
      })
      setReviewComment('')
      setReviewRating(5)
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit. Please log in first.'
      setReviewError(serverMsg)
    }
  }

  const handleRentNow = async () => {
    // Guard: redirect unauthenticated users to login immediately
    if (!session?.user) {
      navigate({ to: '/login' })
      return
    }

    if (!startDate || !endDate) {
      showAlert(
        'Please select start and end dates on the calendar.',
        'Missing Dates',
      )
      return
    }
    const days =
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    const rentalFee = days * (product?.price || 0)
    const discountAmount = appliedCoupon?.discountAmount || 0
    const finalRentalFee = Math.max(0, rentalFee - discountAmount)
    const depositAmount = product?.securityDeposit || 0
    const total = finalRentalFee + depositAmount

    try {
      setIsPaying(true)

      // 1. Create Rental Record
      const rental = await createRental.mutateAsync({
        productId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rentalFee: finalRentalFee,
        depositAmount,
        totalPrice: total,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      })

      // 2. For online payment — redirect to Stripe/Simulated checkout session
      if (paymentMethod === 'online') {
        const bookingSession = await createBookingSession.mutateAsync({
          rentalId: rental.id,
        })
        if (bookingSession?.url) {
          window.location.href = bookingSession.url
          return
        }
      }

      // Show success modal for both cash and online
      setIsBookingOpen(false)
      setShowBookingConfirm(true)
    } catch (err: any) {
      showAlert(
        err.response?.data?.message ||
          'Booking failed. Please make sure you are logged in.',
        'Booking Failed',
      )
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-danger rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h2>
        <p className="text-muted-foreground/85 mb-8 text-center max-w-md">
          The product you are looking for might have been removed or the link is
          incorrect.
        </p>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="rounded-xl font-bold"
        >
          Go Back
        </Button>
      </div>
    )
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ['/assets/product-placeholder.png']
  const liked = isLiked(product.id)

  const address = product.user?.address
  let locationValue = product.location || product.city || 'Surat, Gujarat'
  if (address) {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city || product.city,
      address.state,
      address.postalCode,
    ].filter(Boolean)
    if (parts.length > 0) {
      locationValue = parts.join(', ')
    }
  }

  const conciseLocation =
    product.city ||
    product.location ||
    product.user?.address?.city ||
    'Surat, Gujarat'

  const productInfo = [
    { label: 'Category', value: product.category?.name || t('Uncategorized') },
    {
      label: 'Listing Source',
      value:
        product.listingType === 'shop' ||
        product.user?.address?.addressType?.toLowerCase() === 'shop' ||
        product.user?.addresses?.[0]?.addressType?.toLowerCase() === 'shop'
          ? product.shopName ||
            product.user?.address?.shopName ||
            product.user?.addresses?.[0]?.shopName
            ? `🏪 ${t('Shop:')} ${product.shopName || product.user?.address?.shopName || product.user?.addresses?.[0]?.shopName}`
            : `🏪 ${t('From Shop / Store')}`
          : `🏠 ${t('From Home')}`,
    },
    {
      label: 'Min. Rental',
      value: `${product.minDuration || 1} ${t('day(s)')}`,
    },
    {
      label: 'Max. Rental',
      value: product.maxDuration
        ? `${product.maxDuration} ${t('days')}`
        : t('Unlimited'),
    },
    { label: 'Location', value: locationValue },
    {
      label: 'Listed On',
      value: formatDate(product.createdAt, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    },
  ]

  const rentalDays =
    startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
      : 0
  const totalPrice = rentalDays * product.price

  return (
    <div className="min-h-screen bg-background md:bg-bg-base pt-0 md:pt-20 pb-24 md:pb-16">
      <div className="mx-auto max-w-[1400px] px-0 md:px-10">
        <div className="hidden md:block">
          <ProductBreadcrumbs title={product.title || product.name} />
        </div>

        {/* MOBILE SCREEN LAYOUT */}
        <ProductMobileContent
          product={product}
          images={images}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          liked={liked}
          toggleLike={() => toggleLike(product.id)}
          copied={copied}
          handleShare={handleShare}
          conciseLocation={conciseLocation}
          locationValue={locationValue}
          reviews={reviews}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          reviewError={reviewError}
          handleSubmitReview={handleSubmitReview}
          createReviewIsPending={createReview.isPending}
        />

        {/* DESKTOP LAYOUT */}
        <ProductDesktopContent
          product={product}
          images={images}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          liked={liked}
          toggleLike={() => toggleLike(product.id)}
          copied={copied}
          handleShare={handleShare}
          productInfo={productInfo}
          reviews={reviews}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          reviewError={reviewError}
          handleSubmitReview={handleSubmitReview}
          createReviewIsPending={createReview.isPending}
          today={today}
          productRentals={productRentals}
          handleDayClick={handleDayClick}
          session={session}
          handleRentNow={handleRentNow}
          createRentalIsPending={
            createRental.isPending || confirmPayment.isPending
          }
          handleApplyCoupon={handleApplyCoupon}
          handleRemoveCoupon={handleRemoveCoupon}
          applyCouponIsPending={applyCoupon.isPending}
        />

        {/* Similar Items Section */}
        <SimilarProducts
          categoryId={product.categoryId}
          currentProductId={id}
        />
      </div>

      <BookingConfirmationModal
        isOpen={showBookingConfirm}
        onClose={() => setShowBookingConfirm(false)}
        productTitle={product.title || product.name}
        productImage={images[0]}
        startDate={startDate}
        endDate={endDate}
        paymentMethod={paymentMethod}
        basePrice={totalPrice}
        securityDeposit={product.securityDeposit || 0}
        discountAmount={appliedCoupon?.discountAmount || 0}
        totalPrice={
          Math.max(0, totalPrice - (appliedCoupon?.discountAmount || 0)) +
          (product.securityDeposit || 0)
        }
      />

      {/* Shadcn Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setAlertOpen(false)}
              className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileBookingDrawer
        product={product}
        productRentals={productRentals}
        today={today}
        isBookingOpen={isBookingOpen}
        setIsBookingOpen={setIsBookingOpen}
        handleDayClick={handleDayClick}
        handleRentNow={handleRentNow}
        createRentalPending={createRental.isPending}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        endDate={endDate}
        rentalDays={rentalDays}
        totalPrice={totalPrice}
        appliedCoupon={appliedCoupon}
        isPaying={isPaying}
      />
    </div>
  )
}
