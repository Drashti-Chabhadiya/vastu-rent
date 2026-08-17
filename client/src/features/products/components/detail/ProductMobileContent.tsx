import { Link } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductTabs } from './ProductTabs'

interface ProductMobileContentProps {
  product: any
  images: string[]
  selectedImage: number
  setSelectedImage: (idx: number) => void
  liked: boolean
  toggleLike: () => void
  copied: boolean
  handleShare: () => void
  conciseLocation: string
  locationValue: string
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
}

export const ProductMobileContent = ({
  product,
  images,
  selectedImage,
  setSelectedImage,
  liked,
  toggleLike,
  copied,
  handleShare,
  conciseLocation,
  locationValue,
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
}: ProductMobileContentProps) => {
  const { t, formatDate, formatCurrency, formatDigits } = useTranslation()

  return (
    <div className="block md:hidden bg-background min-h-screen text-foreground pb-10">
      {/* Full-width Image Gallery */}
      <div className="w-full">
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
              <span className="text-muted-foreground/85 px-1 font-bold">·</span>
              <span className="text-xs font-semibold text-muted-foreground/80">
                + {formatCurrency(product.securityDeposit)} {t('deposit')}
              </span>
            </>
          )}
        </div>

        {/* Spec Pills (Horizontal Scroll) */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="shrink-0 px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-black">
            {product.category?.name || t('Uncategorized')}
          </span>
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
          <span className="shrink-0 px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-black">
            {t('Listed')}:{' '}
            {formatDate(product.createdAt, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
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

        {/* Product Tabs (Reviews, FAQs) for Mobile */}
        <div className="pt-4 border-t border-border">
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
      </div>
    </div>
  )
}
