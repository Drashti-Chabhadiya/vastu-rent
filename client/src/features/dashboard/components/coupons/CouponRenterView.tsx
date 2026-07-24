import { useState } from 'react'
import { Ticket } from 'lucide-react'
import type { Coupon } from '#/hook/use-coupons'
import { CouponRenterCard } from './CouponRenterCard'
import { useTranslation } from '#/context/TranslationContext'
import { CouponRenterSkeleton } from '#/components/skeletons'

interface CouponRenterViewProps {
  coupons: Coupon[]
  isLoading: boolean
}

export function CouponRenterView({
  coupons,
  isLoading,
}: CouponRenterViewProps) {
  const { t } = useTranslation()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return <CouponRenterSkeleton />
  }

  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/30 rounded-[2rem] p-8 shadow-sm">
        <Ticket className="text-muted-dark w-16 h-16 mb-4 rotate-[-10deg]" />
        <h3 className="text-lg font-black text-foreground/90">
          {t('No Coupons Available')}
        </h3>
        <p className="text-xs text-muted-dark mt-1 max-w-xs text-center font-bold">
          {t(
            'Check back later for active platform-wide and listing-restricted deals.',
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coupons.map((coupon) => (
        <CouponRenterCard
          key={coupon.id}
          coupon={coupon}
          copiedCode={copiedCode}
          onCopy={handleCopy}
        />
      ))}
    </div>
  )
}
