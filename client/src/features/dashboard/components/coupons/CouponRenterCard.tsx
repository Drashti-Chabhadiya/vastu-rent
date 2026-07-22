import { Copy, CheckCircle2, Tag, Building, Users } from 'lucide-react'
import type { Coupon } from '#/hook/use-coupons'
import { cn } from '#/lib/utils'
import { getScenarioLabel, scenarioColorMap } from '#/lib/coupon-utils'
import { useTranslation } from '#/context/TranslationContext'

interface CouponRenterCardProps {
  coupon: Coupon
  copiedCode: string | null
  onCopy: (code: string) => void
}

export function CouponRenterCard({
  coupon,
  copiedCode,
  onCopy,
}: CouponRenterCardProps) {
  const { t } = useTranslation()
  const discountText =
    coupon.type === 'percentage'
      ? `${coupon.discount}% ${t('OFF')}`
      : `₹${coupon.discount} ${t('OFF')}`

  const scenario = getScenarioLabel(coupon.usageLimit, coupon.perUserLimit)
  const slotsLeft = coupon.usageLimit
    ? coupon.usageLimit - coupon.usedCount
    : null

  return (
    <div
      onClick={() => onCopy(coupon.code)}
      className="bg-card rounded-[2rem] border border-border/30 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer p-6 flex flex-col justify-between min-h-[200px] hover:border-emerald-200"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 bg-emerald-500/5 group-hover:scale-125 transition-all duration-300" />

      <div>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-wide">
            <Tag size={10} /> {t('Active Deal')}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {coupon.minBooking && (
              <span className="text-[10px] text-muted-dark font-bold bg-muted-light px-2 py-0.5 rounded">
                {t('Min.')} ₹{coupon.minBooking.toLocaleString()}
              </span>
            )}
            <span
              className={cn(
                'text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide',
                scenarioColorMap[
                  scenario.color
                ],
              )}
            >
              {t(scenario.label)}
            </span>
          </div>
        </div>

        <h4 className="text-2xl font-black text-emerald-600 tracking-tight mt-3">
          {discountText}
        </h4>

        {coupon.maxDiscount && (
          <p className="text-[10px] font-bold text-muted-dark mt-0.5">
            {t('Save up to')} ₹{coupon.maxDiscount.toLocaleString()}
          </p>
        )}

        {coupon.product?.title && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/85 mt-2">
            <Building size={11} className="text-muted-dark" />
            <span className="truncate max-w-[180px]">
              {t('Valid on:')} {coupon.product.title}
            </span>
          </div>
        )}

        {slotsLeft !== null && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-warning-foreground mt-1.5">
            <Users size={11} />
            <span>
              {slotsLeft}{' '}
              {slotsLeft !== 1 ? t('slots remaining') : t('slot remaining')}
            </span>
          </div>
        )}
      </div>

      {/* Copy strip */}
      <div className="mt-4 pt-4 border-t border-dashed border-border/30 flex items-center justify-between">
        <div className="bg-emerald-500 text-primary-foreground font-black text-[11px] px-3.5 py-1.5 rounded-xl tracking-widest uppercase shadow-sm group-hover:bg-emerald-600 transition-colors">
          {coupon.code}
        </div>
        <span className="text-[9px] font-bold text-muted-dark flex items-center gap-1 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
          {copiedCode === coupon.code ? (
            <>
              <CheckCircle2
                size={11}
                className="text-emerald-500 animate-bounce"
              />{' '}
              {t('Copied!')}
            </>
          ) : (
            <>
              <Copy size={11} /> {t('Copy Code')}
            </>
          )}
        </span>
      </div>
    </div>
  )
}
