import { useState } from 'react'
import { Ticket } from 'lucide-react'
import type { Coupon } from '#/hook/use-coupons'
import { CouponRenterCard } from './CouponRenterCard'
import { Skeleton } from '#/components/ui/skeleton'
import { useTranslation } from '#/context/TranslationContext'

export function CouponRenterSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border/30 rounded-[2rem] p-6 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
          <div className="flex justify-between items-center pt-2 border-t border-border/10">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

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
