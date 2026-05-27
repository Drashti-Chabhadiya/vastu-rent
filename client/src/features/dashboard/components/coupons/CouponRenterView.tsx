import { useState } from 'react'
import { Ticket } from 'lucide-react'
import type { Coupon } from '#/hook/use-coupons'
import { CouponRenterCard } from './CouponRenterCard'

interface CouponRenterViewProps {
  coupons: Coupon[]
  isLoading: boolean
}

export function CouponRenterView({
  coupons,
  isLoading,
}: CouponRenterViewProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-black tracking-widest uppercase">
          Fetching available deals...
        </p>
      </div>
    )
  }

  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <Ticket className="text-slate-300 w-16 h-16 mb-4 rotate-[-10deg]" />
        <h3 className="text-lg font-black text-slate-800">
          No Coupons Available
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs text-center font-bold">
          Check back later for active platform-wide and listing-restricted
          deals.
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
