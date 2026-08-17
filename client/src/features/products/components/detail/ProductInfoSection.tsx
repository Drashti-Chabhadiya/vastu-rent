import {
  Star,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  IndianRupee,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'
import { useProductBookingStore } from '../../../../store/useProductBookingStore'

interface ProductHeaderSectionProps {
  product: any
  productInfo: { label: string; value: string }[]
}

export const ProductHeaderSection = ({
  product,
  productInfo,
}: ProductHeaderSectionProps) => {
  const { formatCurrency, formatDigits, t } = useTranslation()

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/30 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
            {product.title || product.name}
          </h1>
          <Badge className="bg-primary-soft text-primary-hover border border-primary-border px-2.5 py-1 rounded-md flex items-center gap-1 font-bold text-[10px] uppercase shrink-0">
            <CheckCircle2 size={12} /> {t('Verified')}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-foreground text-sm">
              {formatDigits(product.rating || '4.6')}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-muted-foreground/85 text-sm font-medium">
            ({formatDigits(product.reviewsCount || '0')} {t('Reviews')})
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-3xl font-black text-primary">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm font-bold text-muted-foreground/85">
            {t('/day')}
          </span>
          {product.securityDeposit > 0 && (
            <span className="ml-3 text-xs font-medium text-muted-foreground/70">
              + {formatCurrency(product.securityDeposit)} {t('deposit')}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        )}
      </div>

      <hr className="border-border/30" />

      {/* Product Information Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          {t('Product Information')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {productInfo.map((info) => (
            <div
              key={info.label}
              className="flex justify-between sm:grid sm:grid-cols-3 border-b border-border/10 pb-2 sm:border-0 sm:pb-0"
            >
              <span className="col-span-1 text-sm text-muted-foreground/85">
                {t(info.label)}
              </span>
              <span className="col-span-2 text-sm font-medium text-foreground text-right sm:text-left">
                {formatDigits(info.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-border/30" />

      {/* Trust Features */}
      <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
        {[
          {
            icon: <CheckCircle2 size={16} />,
            title: t('Free Delivery'),
            desc: t('Within 10 km'),
          },
          {
            icon: <MessageCircle size={16} />,
            title: t('Quick Support'),
            desc: t('24/7 Assistance'),
          },
          {
            icon: <ShieldCheck size={16} />,
            title: t('Secure Payment'),
            desc: t('100% Safe'),
          },
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
              {feature.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground leading-tight">
                {feature.title}
              </p>
              <p className="text-[10px] text-muted-foreground/85">
                {formatDigits(feature.desc)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Save More Banner */}
      <div className="p-4 rounded-xl bg-primary-soft border border-primary-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary shrink-0 shadow-sm">
          <AlertCircle size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">
            {t('Save more with longer rentals!')}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDigits(t('Rent for a week or more and get up to 20% off.'))}
          </p>
        </div>
      </div>
    </div>
  )
}

interface ProductBookingSectionProps {
  product: any
  handleRentNow: () => void
  createRentalIsPending: boolean
  handleApplyCoupon: () => void
  handleRemoveCoupon: () => void
  applyCouponIsPending: boolean
  availabilityCalendar: React.ReactNode
}

export const ProductBookingSection = ({
  product,
  // handleRentNow,
  createRentalIsPending,
  handleApplyCoupon,
  handleRemoveCoupon,
  applyCouponIsPending,
  availabilityCalendar,
}: ProductBookingSectionProps) => {
  const { formatCurrency, formatDate, formatNumber, t } = useTranslation()
  const {
    paymentMethod,
    setPaymentMethod,
    startDate,
    endDate,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isPaying,
  } = useProductBookingStore()

  const rentalDays =
    startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
      : 0
  const totalPrice = rentalDays * product.price

  const discountAmount = appliedCoupon?.discountAmount || 0
  const finalPayable = Math.max(
    0,
    totalPrice - discountAmount + (product.securityDeposit || 0),
  )

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/30 shadow-sm space-y-6">
      {/* Mini Pricing Header */}
      <div className="flex items-baseline justify-between pb-2 border-b border-border/30">
        <div>
          <span className="text-2xl font-black text-primary">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs font-bold text-muted-foreground/85">
            {t('/day')}
          </span>
        </div>
        {product.securityDeposit > 0 && (
          <span className="text-xs font-medium text-muted-foreground/70">
            {t('Deposit:')} {formatCurrency(product.securityDeposit)}
          </span>
        )}
      </div>

      {/* Availability Calendar */}
      <div>{availabilityCalendar}</div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <div className="text-[13px] font-bold text-foreground flex items-center gap-2">
          <IndianRupee size={14} className="text-primary" />
          {t('Payment Method')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPaymentMethod('online')}
            className={cn(
              'relative p-3 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-1 hover:bg-transparent active:scale-[0.98] overflow-hidden',
              paymentMethod === 'online'
                ? 'border-brand bg-primary/5 text-primary hover:text-primary hover:bg-primary/5'
                : 'border-border/30 bg-muted-light text-muted-foreground/85 hover:border-border hover:text-muted-foreground/85 hover:bg-muted-light',
            )}
          >
            {paymentMethod === 'online' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <ShieldCheck
              size={18}
              className={paymentMethod === 'online' ? 'text-primary' : ''}
            />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {t('Online Pay')}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPaymentMethod('cash')}
            className={cn(
              'relative p-3 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-1 hover:bg-transparent active:scale-[0.98] overflow-hidden',
              paymentMethod === 'cash'
                ? 'border-brand bg-primary/5 text-primary hover:text-primary hover:bg-primary/5'
                : 'border-border/30 bg-muted-light text-muted-foreground/85 hover:border-border hover:text-muted-foreground/85 hover:bg-muted-light',
            )}
          >
            {paymentMethod === 'cash' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <MessageCircle
              size={18}
              className={paymentMethod === 'cash' ? 'text-primary' : ''}
            />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {t('Cash on Pickup')}
            </span>
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          // onClick={handleRentNow}
          disabled={createRentalIsPending || isPaying}
          className="group w-full h-12 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {createRentalIsPending || isPaying ? (
            <>
              {t('Processing...')}
              <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              {t('Rent Now')}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                <ArrowRight size={14} className="shrink-0" />
              </span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="group w-full h-12 rounded-full border-border font-bold text-foreground/80 hover:bg-muted-light active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          onClick={() =>
            window.open(
              `mailto:${product.user?.email || ''}?subject=Inquiry about ${product.title || product.name}`,
            )
          }
        >
          {t('Chat with User')}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted transition-transform group-hover:translate-x-1">
            <MessageCircle
              size={14}
              className="shrink-0 text-muted-foreground"
            />
          </span>
        </Button>
      </div>

      {startDate && (
        <div className="p-4 rounded-xl bg-primary/5 border border-brand/10 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-foreground/80">
            <span className="font-bold">{t('Dates:')}</span>
            <span>
              {formatDate(startDate)}{' '}
              {endDate ? `→ ${formatDate(endDate)}` : `→ ${t('Pick end date')}`}
            </span>
          </div>
          {endDate && (
            <>
              <div className="flex items-center justify-between text-xs text-foreground/80">
                <span className="font-bold">
                  {t('Rental Fee ({count} days):').replace(
                    '{count}',
                    formatNumber(rentalDays),
                  )}
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              {/* Coupon Row */}
              <div className="pt-2 border-t border-brand/5 space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider block">
                  {t('Marketplace Promo Code')}
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 px-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-black text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 truncate">
                        {t('Discount Applied')}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleRemoveCoupon}
                      className="text-[9px] font-black text-destructive hover:text-destructive uppercase tracking-wider shrink-0 transition-colors p-0 h-auto active:scale-[0.98]"
                    >
                      {t('Remove')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('Enter code (e.g. MONSOON30)')}
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="h-9 rounded-xl bg-card border-border text-xs font-bold placeholder:text-muted-dark"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyCouponIsPending || !couponCode.trim()}
                        className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shrink-0 active:scale-[0.98]"
                      >
                        {applyCouponIsPending ? t('Applying...') : t('Apply')}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] font-bold text-destructive flex items-center gap-1 pl-1">
                        <AlertCircle size={10} /> {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-lg">
                  <span>
                    {t('Coupon Discount ({code}):').replace(
                      '{code}',
                      appliedCoupon.code,
                    )}
                  </span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-foreground/80">
                <span className="font-bold">
                  {t('Security Deposit (Refundable):')}
                </span>
                <span>{formatCurrency(product.securityDeposit || 0)}</span>
              </div>
              <div className="pt-2 border-t border-brand/10 flex items-center justify-between text-sm text-foreground font-black">
                <span>{t('Total Payable:')}</span>
                <span className="text-primary">
                  {formatCurrency(finalPayable)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Default export alias for compatibility
export const ProductInfoSection = (props: any) => {
  return (
    <div className="space-y-6">
      <ProductHeaderSection {...props} />
      <ProductBookingSection {...props} />
    </div>
  )
}
