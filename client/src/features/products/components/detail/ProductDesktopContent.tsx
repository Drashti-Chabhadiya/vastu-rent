import { ProductImageGallery } from './ProductImageGallery'
import { ProductTabs } from './ProductTabs'
import {
  ProductHeaderSection,
  ProductBookingSection,
} from './ProductInfoSection'
import { ProductUserCard } from './ProductUserCard'
import { AvailabilityCalendar } from './AvailabilityCalendar'

interface ProductDesktopContentProps {
  product: any
  images: string[]
  selectedImage: number
  setSelectedImage: (idx: number) => void
  liked: boolean
  toggleLike: () => void
  copied: boolean
  handleShare: () => void
  productInfo: any[]
  reviews: any[]
  activeTab: string
  setActiveTab: (tab: string) => void
  reviewRating: number
  setReviewRating: (rating: number) => void
  reviewComment: string
  setReviewComment: (comment: string) => void
  reviewError: string
  handleSubmitReview: () => void
  createReviewIsPending: boolean
  today: Date
  productRentals: any[]
  handleDayClick: (day: number) => void
  session: any
  handleRentNow: () => void
  createRentalIsPending: boolean
  handleApplyCoupon: () => void
  handleRemoveCoupon: () => void
  applyCouponIsPending: boolean
}

export const ProductDesktopContent = ({
  product,
  images,
  selectedImage,
  setSelectedImage,
  liked,
  toggleLike,
  copied,
  handleShare,
  productInfo,
  reviews,
  activeTab,
  setActiveTab,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewError,
  handleSubmitReview,
  createReviewIsPending,
  today,
  productRentals,
  handleDayClick,
  session,
  handleRentNow,
  createRentalIsPending,
  handleApplyCoupon,
  handleRemoveCoupon,
  applyCouponIsPending,
}: ProductDesktopContentProps) => {
  return (
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
            toggleLike={toggleLike}
            copied={copied}
            handleShare={handleShare}
          />

          {/* Product Title, Rating, Specs Table & Trust Badges */}
          <ProductHeaderSection product={product} productInfo={productInfo} />

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
            createReviewIsPending={createReviewIsPending}
          />
        </div>

        {/* Right Column: Sticky Booking Widget & Details */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5 space-y-8 sticky top-24">
          <ProductBookingSection
            product={product}
            handleRentNow={handleRentNow}
            createRentalIsPending={createRentalIsPending}
            handleApplyCoupon={handleApplyCoupon}
            handleRemoveCoupon={handleRemoveCoupon}
            applyCouponIsPending={applyCouponIsPending}
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
    </div>
  )
}
