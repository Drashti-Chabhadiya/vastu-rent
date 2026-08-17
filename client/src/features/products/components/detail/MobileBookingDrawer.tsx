import { Drawer, DrawerContent } from '#/components/ui/drawer'
import { useTranslation } from '#/context/TranslationContext'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { Button } from '#/components/ui/button'
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MessageSquare,
} from 'lucide-react'
import { cn } from '#/lib/utils'

interface MobileBookingDrawerProps {
  product: any
  productRentals: any[]
  today: Date
  isBookingOpen: boolean
  setIsBookingOpen: (open: boolean) => void
  handleDayClick: (day: number) => void
  handleRentNow: () => void
  createRentalPending: boolean
  paymentMethod: string
  setPaymentMethod: (method: 'online' | 'cash') => void
  endDate: Date | null
  rentalDays: number
  totalPrice: number
  appliedCoupon: any
  isPaying: boolean
}

export const MobileBookingDrawer = ({
  product,
  productRentals,
  today,
  isBookingOpen,
  setIsBookingOpen,
  handleDayClick,
  handleRentNow,
  createRentalPending,
  paymentMethod,
  setPaymentMethod,
  endDate,
  rentalDays,
  totalPrice,
  appliedCoupon,
  isPaying,
}: MobileBookingDrawerProps) => {
  const { t, formatCurrency, formatDigits } = useTranslation()

  return (
    <>
      {/* Mobile Fixed Bottom Booking Bar (Screen 03 mockup details) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/30 p-3.5 flex items-center justify-between shadow-xl md:hidden select-none">
        <div>
          <div className="font-extrabold text-[15px] text-foreground">
            {formatCurrency(product.price)}
            <span className="text-[10px] font-semibold text-muted-foreground">
              /day
            </span>
          </div>
          <div className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('Available now')}
          </div>
        </div>
        <Button
          onClick={() => setIsBookingOpen(true)}
          className="h-10 px-5 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-full flex items-center gap-1 shadow-md border-none cursor-pointer"
        >
          {t('Check availability')} &nbsp;&rsaquo;
        </Button>
      </div>

      {/* Mobile Booking Drawer (Screen 04 mockup details) */}
      <Drawer open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DrawerContent className="bg-background text-foreground border-none rounded-t-[30px] max-h-[90vh] flex flex-col outline-none">
          {/* Sticky Header */}
          <div className="flex items-center justify-between p-6 pb-4 shrink-0 bg-background rounded-t-[30px] z-10">
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

          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2 space-y-6">
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
                    'relative p-4 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:bg-transparent active:scale-[0.98] cursor-pointer overflow-hidden',
                    paymentMethod === 'online'
                      ? 'border-primary bg-primary/5 text-primary hover:text-primary hover:bg-primary/10'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  {paymentMethod === 'online' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <CreditCard
                    size={18}
                    className={paymentMethod === 'online' ? 'text-primary' : ''}
                  />
                  <span className="text-[11px] font-bold tracking-wider">
                    {t('Online Pay')}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    'relative p-4 h-auto rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:bg-transparent active:scale-[0.98] cursor-pointer overflow-hidden',
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5 text-primary hover:text-primary hover:bg-primary/10'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  {paymentMethod === 'cash' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <MessageSquare
                    size={18}
                    className={paymentMethod === 'cash' ? 'text-primary' : ''}
                  />
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
                      {formatCurrency(product.price)} x{' '}
                      {formatDigits(rentalDays)} {t('days')}
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
                      <span>
                        -{formatCurrency(appliedCoupon.discountAmount)}
                      </span>
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
              onClick={handleRentNow}
              disabled={createRentalPending || isPaying}
              className="group w-full h-12 rounded-full bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none mt-2 cursor-pointer"
            >
              {createRentalPending || isPaying ? (
                <>
                  {t('Reserving')}
                  <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  {t('Reserve')}
                  {endDate &&
                    ` · ${formatCurrency(
                      Math.max(
                        0,
                        totalPrice - (appliedCoupon?.discountAmount || 0),
                      ) + (product.securityDeposit || 0),
                    )}`}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} className="shrink-0" />
                  </span>
                </>
              )}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
