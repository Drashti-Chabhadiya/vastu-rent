import { Link, useNavigate } from '@tanstack/react-router'
import {
  useProduct,
  useProducts,
  useWishlist,
  useCreateRental,
  useProductRentals,
  useApplyCoupon,
} from '#/hook'
import { useProductReviews, useCreateReview } from '#/hook/use-reviews'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '#/lib/api'
import { authClient } from '#/lib/auth/auth-client'

// Subcomponents import
import { ProductBreadcrumbs } from './detail/ProductBreadcrumbs'
import { ProductImageGallery } from './detail/ProductImageGallery'
import { ProductTabs } from './detail/ProductTabs'
import { ProductInfoSection } from './detail/ProductInfoSection'
import { ProductOwnerCard } from './detail/ProductOwnerCard'
import { AvailabilityCalendar } from './detail/AvailabilityCalendar'
import { BookingConfirmationModal } from './detail/BookingConfirmationModal'

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  // Calendar state
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Share state
  const [copied, setCopied] = useState(false)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  // Booking modal state
  const [showBookingConfirm, setShowBookingConfirm] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>(
    'online',
  )

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
    discountAmount: number
  } | null>(null)
  const [couponError, setCouponError] = useState('')
  const applyCoupon = useApplyCoupon()

  // Reset coupon if dates change
  useEffect(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }, [startDate, endDate])

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

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

      // If COD, we are done
      if (paymentMethod === 'cash') {
        setShowBookingConfirm(true)
        setIsPaying(false)
        return
      }

      // 2. Create Razorpay Order (Only for online)
      const {
        data: { order },
      } = await apiClient.post('/payments/create-order', {
        rentalId: rental.id,
      })

      // 3. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_placeholder', // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: 'Vastu Rent',
        description: `Rental for ${product.title || product.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 4. Verify Payment
          try {
            await apiClient.post('/payments/verify-payment', {
              ...response,
              rentalId: rental.id,
            })
            setShowBookingConfirm(true)
          } catch (err) {
            alert('Payment verification failed. Please contact support.')
          } finally {
            setIsPaying(false)
          }
        },
        prefill: {
          name: '', // Can fill from session
          email: '',
        },
        theme: {
          color: 'var(--color-primary)',
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setIsPaying(false)
      alert(
        err.response?.data?.message ||
          'Booking failed. Please make sure you are logged in.',
      )
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

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const monthName = new Date(calYear, calMonth).toLocaleString('default', {
    month: 'long',
  })
  const rentalDays =
    startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
      : 0
  const totalPrice = rentalDays * product.price

  return (
    <div className="min-h-screen bg-bg-base pt-20 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ProductBreadcrumbs title={product.title || product.name} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Images and Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
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

          {/* Right Side (7 cols) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Middle Column (Product Info - 7 cols of 12) */}
              <div className="xl:col-span-7">
                <ProductInfoSection
                  product={product}
                  productInfo={productInfo}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  handleRentNow={handleRentNow}
                  createRentalIsPending={createRental.isPending}
                  isPaying={isPaying}
                  startDate={startDate}
                  endDate={endDate}
                  rentalDays={rentalDays}
                  totalPrice={totalPrice}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleApplyCoupon={handleApplyCoupon}
                  appliedCoupon={appliedCoupon}
                  handleRemoveCoupon={handleRemoveCoupon}
                  couponError={couponError}
                  applyCouponIsPending={applyCoupon.isPending}
                />
              </div>

              {/* Rightmost Column (Sidebar - 5 cols of 12) */}
              <div className="xl:col-span-5 space-y-6">
                <ProductOwnerCard owner={product.owner} />

                <AvailabilityCalendar
                  calMonth={calMonth}
                  calYear={calYear}
                  setCalMonth={setCalMonth}
                  setCalYear={setCalYear}
                  daysInMonth={daysInMonth}
                  firstDay={firstDay}
                  monthName={monthName}
                  startDate={startDate}
                  endDate={endDate}
                  today={today}
                  productRentals={productRentals}
                  handleDayClick={handleDayClick}
                />
              </div>
            </div>

            {/* Similar Items Section */}
            {similarProducts && similarProducts.length > 0 && (
              <div className="mt-10">
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
      </div>

      <BookingConfirmationModal
        isOpen={showBookingConfirm}
        onClose={() => setShowBookingConfirm(false)}
        productTitle={product.title || product.name}
        startDate={startDate}
        endDate={endDate}
        totalPrice={
          Math.max(0, totalPrice - (appliedCoupon?.discountAmount || 0)) +
          (product.securityDeposit || 0)
        }
      />
    </div>
  )
}
