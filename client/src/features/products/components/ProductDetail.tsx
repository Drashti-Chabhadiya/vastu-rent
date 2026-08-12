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
  useCancelBookingSession,
} from '#/hook'
import { toast } from 'sonner'
import { Share } from '@capacitor/share'
import { useProductReviews, useCreateReview } from '#/hook/use-reviews'
import { ProductCard } from '#/components/common/ProductCard'
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
import {
  AlertCircle,
  CreditCard,
  MessageSquare,
  Loader2,
  MapPin,
} from 'lucide-react'
import { Drawer, DrawerContent } from '#/components/ui/drawer'
import { useSessionContext } from '#/context/SessionContext'
import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import { ProductBreadcrumbs } from './detail/ProductBreadcrumbs'
import { ProductImageGallery } from './detail/ProductImageGallery'
import { ProductTabs } from './detail/ProductTabs'
import {
  ProductHeaderSection,
  ProductBookingSection,
} from './detail/ProductInfoSection'
import { ProductUserCard } from './detail/ProductUserCard'
import { AvailabilityCalendar } from './detail/AvailabilityCalendar'
import { BookingConfirmationModal } from './detail/BookingConfirmationModal'
import { useProductBookingStore } from '../../../store/useProductBookingStore'
import { cn } from '#/lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'

export function ProductDetail({ id }: { id: string }) {
  const { t, formatDate, formatCurrency, formatDigits } = useTranslation()
  const navigate = useNavigate()
  const { data: session } = useSessionContext()
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

        {/* MOBILE SCREEN LAYOUT (block md:hidden) */}
        <div className="block md:hidden bg-background min-h-screen text-foreground pb-10">
          {/* Full-width Image Gallery */}
          <div className="w-full">
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

          {/* Product Details Body Card */}
          <div className="px-5 py-6 space-y-6">
            {/* Verified Host Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-primary text-[10px] font-black uppercase tracking-wider">
                ✓ {t('VERIFIED HOST')}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight tracking-tight">
              {product.title || product.name}
            </h1>

            {/* Rating, Reviews, Location */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/90">
              <span className="text-amber-600 font-black flex items-center gap-0.5">
                ★ {formatDigits(product.rating || '5.0')}
              </span>
              <span>·</span>
              <span>
                ({formatDigits(product.reviewsCount || '0')} {t('reviews')})
              </span>
              <span>·</span>
              <span>{formatDigits(conciseLocation)}</span>
            </div>

            {/* Price & Deposit */}
            <div className="flex items-baseline gap-1 pt-1 text-foreground">
              <span className="text-3xl font-black">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground/80">
                {t('/day')}
              </span>
              {product.securityDeposit > 0 && (
                <>
                  <span className="text-muted-foreground/85 px-1 font-bold">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground/80">
                    + {formatCurrency(product.securityDeposit)} {t('deposit')}
                  </span>
                </>
              )}
            </div>

            {/* Spec Pills (Horizontal Scroll) */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="shrink-0 px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-black">
                {t('Min. {days} day(s)').replace(
                  '{days}',
                  String(product.minDuration || 1),
                )}
              </span>
              <span className="shrink-0 px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-black">
                {product.maxDuration
                  ? t('Max. {days} days').replace(
                      '{days}',
                      String(product.maxDuration),
                    )
                  : t('Unlimited')}
              </span>
            </div>

            <hr className="border-border" />

            {/* Description Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-foreground">
                {t('Description')}
              </h2>
              <p className="text-muted-foreground/95 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Full Location Section */}
            {locationValue && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h2 className="text-lg font-extrabold text-foreground">
                  {t('Location')}
                </h2>
                <div className="flex items-start gap-2 text-muted-foreground/95 text-xs sm:text-sm">
                  <MapPin size={16} className="shrink-0 text-primary mt-0.5" />
                  <span className="leading-relaxed">
                    {formatDigits(locationValue)}
                  </span>
                </div>
              </div>
            )}

            {/* Lister User Card (mockup style) */}
            {product.user && (
              <div className="rounded-[20px] border border-border p-4 flex items-center justify-between bg-card/40">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-primary text-white font-bold flex items-center justify-center shrink-0">
                    {product.user.image ? (
                      <img
                        src={product.user.image}
                        alt={product.user.name || 'Host'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <span className="text-sm font-bold uppercase">
                      {product.user.name?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">
                      {product.user.name || t('Vastu Shop')}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground/80">
                      {t('Usually responds in a few hours')}
                    </div>
                  </div>
                </div>
                <Link
                  to="/users/$id"
                  params={{ id: product.user.id || '' }}
                  className="text-primary font-black text-xs hover:underline flex items-center gap-1 shrink-0"
                >
                  {t('View')} &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP LAYOUT (hidden md:block) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Media & Product Main Info */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-7 space-y-8">
              {/* Image Gallery */}
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

              {/* Product Title, Rating, Specs Table & Trust Badges */}
              <ProductHeaderSection
                product={product}
                productInfo={productInfo}
              />

              {/* Product Tabs (Description, Details, Reviews, FAQs) */}
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

            {/* Right Column: Sticky Booking Widget & Lister Card */}
            <div
              id="booking-section"
              className="col-span-1 lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-24"
            >
              {/* Booking & Checkout Widget */}
              <ProductBookingSection
                product={product}
                handleRentNow={handleRentNow}
                createRentalIsPending={
                  createRental.isPending || confirmPayment.isPending
                }
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

              {/* Lister User Card */}
              <ProductUserCard user={product.user} session={session} />
            </div>
          </div>

          {/* Similar Items Section */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">
                  {t('Similar Items')}
                </h3>
                <ExploreLink to="/products">{t('View all')}</ExploreLink>
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
              className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Fixed Bottom Booking Bar (Screen 03 mockup details) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/30 p-3.5 flex items-center justify-between shadow-xl md:hidden select-none">
        <div>
          <div className="font-extrabold text-[15px] text-foreground">
            {formatCurrency(product.price)}
            <span className="text-[10px] font-semibold text-muted-foreground">
              /day
            </span>
          </div>
          <div className="text-[9.5px] font-black text-primary-soft flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-soft animate-pulse" />
            {t('Available now')}
          </div>
        </div>
        <Button
          onClick={() => setIsBookingOpen(true)}
          className="h-10 px-5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-full flex items-center gap-1 shadow-md border-none cursor-pointer"
        >
          {t('Check availability')} &nbsp;&rsaquo;
        </Button>
      </div>

      {/* Mobile Booking Drawer (Screen 04 mockup details) */}
      <Drawer open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DrawerContent className="bg-background text-foreground border-none rounded-t-[30px] p-6 pb-8 space-y-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-foreground">
              {t('Check availability')}
            </h3>
            <button
              onClick={() => setIsBookingOpen(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-dark hover:bg-muted-light border-none cursor-pointer font-bold text-base"
            >
              &times;
            </button>
          </div>

          {/* Availability Calendar */}
          <div className="-mx-2">
            <AvailabilityCalendar
              today={today}
              productRentals={productRentals}
              handleDayClick={handleDayClick}
              variant="sheet"
            />
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <div className="text-[11px] font-extrabold text-muted-foreground/80 uppercase tracking-wider">
              {t('PAYMENT METHOD')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentMethod('online')}
                className={cn(
                  'p-4 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:bg-transparent active:scale-[0.98] border-none shadow-sm cursor-pointer',
                  paymentMethod === 'online'
                    ? 'border-primary ring-2 ring-primary bg-muted text-primary hover:text-primary hover:bg-muted'
                    : 'border-border bg-white text-muted-foreground/80 hover:border-border hover:text-muted-foreground/80',
                )}
              >
                <CreditCard size={18} />
                <span className="text-[11px] font-bold tracking-wider">
                  {t('Online Pay')}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'p-4 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:bg-transparent active:scale-[0.98] border-none shadow-sm cursor-pointer',
                  paymentMethod === 'cash'
                    ? 'border-primary ring-2 ring-primary bg-muted text-primary hover:text-primary hover:bg-muted'
                    : 'border-border bg-white text-muted-foreground/80 hover:border-border hover:text-muted-foreground/80',
                )}
              >
                <MessageSquare size={18} />
                <span className="text-[11px] font-bold tracking-wider">
                  {t('Cash on pickup')}
                </span>
              </Button>
            </div>
          </div>

          {/* Price Breakdown */}
          {endDate && (
            <div className="bg-muted/40 rounded-[20px] p-4 border border-border space-y-2.5">
              <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                {t('PRICE DETAILS')}
              </div>
              <div className="space-y-2 text-xs font-semibold text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/85">
                    {formatCurrency(product.price)} x {formatDigits(rentalDays)}{' '}
                    {t('days')}
                  </span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                {product.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/85">
                      {t('Refundable Security Deposit')}
                    </span>
                    <span>{formatCurrency(product.securityDeposit)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>
                      {t('Coupon Discount')} ({appliedCoupon.code})
                    </span>
                    <span>-{formatCurrency(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between text-sm font-black pt-0.5">
                  <span>{t('Total Amount')}</span>
                  <span>
                    {formatCurrency(
                      Math.max(
                        0,
                        totalPrice - (appliedCoupon?.discountAmount || 0),
                      ) + (product.securityDeposit || 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reserve / Book Button */}
          <Button
            onClick={() => {
              setIsBookingOpen(false)
              handleRentNow()
            }}
            disabled={createRental.isPending || isPaying}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1 border-none mt-2 cursor-pointer"
          >
            {createRental.isPending || isPaying ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            {t('Reserve')}
            {endDate &&
              ` · ${formatCurrency(
                Math.max(0, totalPrice - (appliedCoupon?.discountAmount || 0)) +
                  (product.securityDeposit || 0),
              )}`}
            &nbsp;&rsaquo;
          </Button>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
