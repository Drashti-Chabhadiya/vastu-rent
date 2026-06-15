import { Link, useNavigate } from '@tanstack/react-router'
import {
  useProduct,
  useProducts,
  useWishlist,
  useCreateRental,
  useProductRentals,
  useApplyCoupon,
  useConfirmPayment,
  useCreateBookingSession,
} from '#/hook'
import { toast } from 'sonner'
import { useProductReviews, useCreateReview } from '#/hook/use-reviews'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'

// Subcomponents import
import { ProductBreadcrumbs } from './detail/ProductBreadcrumbs'
import { ProductImageGallery } from './detail/ProductImageGallery'
import { ProductTabs } from './detail/ProductTabs'
import { ProductInfoSection } from './detail/ProductInfoSection'
import { ProductUserCard } from './detail/ProductUserCard'
import { AvailabilityCalendar } from './detail/AvailabilityCalendar'
import { BookingConfirmationModal } from './detail/BookingConfirmationModal'
import { useProductBookingStore } from '../../../store/useProductBookingStore'

export function ProductDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const { data: product, isLoading, error } = useProduct(id)
  const { data: similarProducts } = useProducts({
    categoryId: product?.categoryId,
  })
  const { toggleLike, isLiked } = useWishlist()
  const { data: reviews = [] } = useProductReviews(id)
  const { data: productRentals = [] } = useProductRentals(id)
  const createRental = useCreateRental()
  const createReview = useCreateReview(id)
  const confirmPayment = useConfirmPayment()
  const createBookingSession = useCreateBookingSession()
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

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
    paymentMethod,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    setCouponError,
    resetBooking,
  } = useProductBookingStore()

  // Share state
  const [copied, setCopied] = useState(false)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  const applyCoupon = useApplyCoupon()
  const today = new Date()

  // Reset booking when id changes
  useEffect(() => {
    resetBooking()
  }, [id, resetBooking])

  // Show error if payment was cancelled
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment_cancelled') === 'true') {
      toast.error('Payment was cancelled. You can try booking again.')
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      )
    }
  }, [])

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

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

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
        alert('This range includes dates that are already booked.')
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
      alert('Please select start and end dates on the calendar.')
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
        const session = await createBookingSession.mutateAsync({ rentalId: rental.id })
        if (session?.url) {
          window.location.href = session.url
          return
        }
      }

      // Show success modal for both cash and online
      setShowBookingConfirm(true)
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          'Booking failed. Please make sure you are logged in.',
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
      : [
          'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=800&q=80',
        ]
  const liked = isLiked(product.id)

  const productInfo = [
    { label: 'Category', value: product.category?.name || 'Uncategorized' },
    { label: 'Condition', value: product.condition || 'Good' },
    { label: 'Min. Rental', value: `${product.minDuration || 1} day(s)` },
    {
      label: 'Max. Rental',
      value: product.maxDuration ? `${product.maxDuration} days` : 'Unlimited',
    },
    { label: 'Location', value: product.location || 'Ahmedabad, Gujarat' },
    {
      label: 'Listed On',
      value: new Date(product.createdAt).toLocaleDateString('en-IN', {
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
    <div className="min-h-screen bg-bg-base pt-20 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ProductBreadcrumbs title={product.title || product.name} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Image Gallery */}
          <div className="col-span-1 lg:col-span-5 order-1">
            <ProductImageGallery
              images={images}
              title={product.title || product.name}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              liked={liked}
              toggleLike={() => toggleLike(product.id)}
              copied={copied}
              handleShare={handleShare}
            />
          </div>

          {/* Product Info Section */}
          <div className="col-span-1 lg:col-span-7 xl:col-span-4 order-2 lg:order-2 lg:row-span-2 xl:row-span-1">
            <ProductInfoSection
              product={product}
              productInfo={productInfo}
              handleRentNow={handleRentNow}
              createRentalIsPending={createRental.isPending || confirmPayment.isPending}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              applyCouponIsPending={applyCoupon.isPending}
              availabilityCalendar={
                <AvailabilityCalendar
                  today={today}
                  productRentals={productRentals}
                  handleDayClick={handleDayClick}
                />
              }
            />
          </div>

          {/* Sidebar: Lister & Calendar (Desktop Only) */}
          <div className="col-span-1 lg:col-span-7 xl:col-span-3 order-3 lg:order-4 xl:order-3 space-y-6">
            <ProductUserCard user={product.user} />

            <div className="hidden xl:block">
              <AvailabilityCalendar
                today={today}
                productRentals={productRentals}
                handleDayClick={handleDayClick}
              />
            </div>
          </div>

          {/* Product Tabs (Reviews / Description) */}
          <div className="col-span-1 lg:col-span-5 order-4 lg:order-3 xl:order-4 mt-4 lg:mt-0">
            <ProductTabs
              product={product}
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
          </div>

          {/* Similar Items Section */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="col-span-1 lg:col-span-12 order-5 mt-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">
                  Similar Items
                </h3>
                <Link
                  to="/products"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {similarProducts
                  .filter((p: any) => p.id !== id)
                  .slice(0, 3)
                  .map((item: any) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BookingConfirmationModal
        isOpen={showBookingConfirm}
        onClose={() => setShowBookingConfirm(false)}
        productTitle={product.title || product.name}
        startDate={startDate}
        endDate={endDate}
        paymentMethod={paymentMethod}
        totalPrice={
          Math.max(0, totalPrice - (appliedCoupon?.discountAmount || 0)) +
          (product.securityDeposit || 0)
        }
      />
    </div>
  )
}
