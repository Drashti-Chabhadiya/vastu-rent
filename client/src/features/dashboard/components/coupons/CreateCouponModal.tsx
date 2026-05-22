import { useState } from 'react'
import {
  X,
  Info,
  Ticket,
  Users,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCreateCoupon, useMyListings } from '#/hook'
import { cn } from '#/lib/utils'
import { scenarioColorMap } from '#/lib/coupon-utils'

interface CreateCouponModalProps {
  isOpen: boolean
  isOwner: boolean
  isAdmin: boolean
  onClose: () => void
}

export function CreateCouponModal({
  isOpen,
  isOwner,
  isAdmin: _isAdmin,
  onClose,
}: CreateCouponModalProps) {
  const createMutation = useCreateCoupon()
  const { data: myListings } = useMyListings()

  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [minBooking, setMinBooking] = useState('')
  const [endDate, setEndDate] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [productId, setProductId] = useState('')
  const [perUserLimit, setPerUserLimit] = useState('')

  const resetForm = () => {
    setCode('')
    setDiscount('')
    setMaxDiscount('')
    setMinBooking('')
    setEndDate('')
    setUsageLimit('')
    setProductId('')
    setPerUserLimit('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Live preview of the scenario being configured
  const previewScenario = (() => {
    const gl = usageLimit ? parseInt(usageLimit) : null
    const pu = perUserLimit ? parseInt(perUserLimit) : null
    if (gl && pu)
      return {
        icon: ShieldCheck,
        label: `First ${gl} users total, max ${pu}× each`,
        color: 'text-violet-700 bg-violet-50 border-violet-100',
      }
    if (gl)
      return {
        icon: Globe,
        label: `First ${gl} users (First Come First Serve)`,
        color: scenarioColorMap['amber'],
      }
    if (pu)
      return {
        icon: Users,
        label:
          pu === 1
            ? 'Every user can use once only'
            : `Every user can use ${pu} times`,
        color: scenarioColorMap['rose'],
      }
    return {
      icon: Ticket,
      label: 'Unlimited — anyone can use anytime',
      color: scenarioColorMap['emerald'],
    }
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discount || !endDate) return

    createMutation.mutate(
      {
        code,
        discount: parseFloat(discount),
        type,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        minBooking: minBooking ? parseFloat(minBooking) : undefined,
        startDate: new Date().toISOString(),
        endDate: new Date(endDate).toISOString(),
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        productId: productId || undefined,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : undefined,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 border border-gray-100 shadow-2xl relative my-4">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">
          Create Coupon
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-semibold">
          Configure discount rules, limits, and scope for your voucher campaign.
        </p>

        {/* Live scenario preview */}
        <div
          className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border mb-5 transition-all',
            previewScenario.color,
          )}
        >
          <previewScenario.icon size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider">
              Scenario Preview
            </p>
            <p className="text-[11px] font-bold mt-0.5">{previewScenario.label}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Voucher code */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Voucher Code
            </label>
            <Input
              required
              placeholder="e.g. WELCOME50, FIRST100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-11 rounded-xl uppercase font-black tracking-widest text-emerald-600"
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-11 border border-gray-200 rounded-xl px-3 bg-white text-xs font-bold text-slate-700"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Value
              </label>
              <Input
                required
                type="number"
                placeholder="e.g. 10 or 150"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Target listing (owners only) */}
          {isOwner && myListings && myListings.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Applicable Listing
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-11 border border-gray-200 rounded-xl px-3 bg-white text-xs font-bold text-slate-700"
              >
                <option value="">All My Listings</option>
                {myListings.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Max discount + Min booking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Max Discount (₹)
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Min Booking (₹)
              </label>
              <Input
                type="number"
                placeholder="None"
                value={minBooking}
                onChange={(e) => setMinBooking(e.target.value)}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Expiry Date
            </label>
            <Input
              required
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 rounded-xl text-xs text-slate-700 font-bold"
            />
          </div>

          {/* Redemption Limits */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={12} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Redemption Limits
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Global Limit (FCFS)
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="∞ Unlimited"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
                <p className="text-[8px] text-slate-400 font-bold mt-1">
                  Total times anyone can use this code.
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Per-User Limit
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="∞ Unlimited"
                  value={perUserLimit}
                  onChange={(e) => setPerUserLimit(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
                <p className="text-[8px] text-slate-400 font-bold mt-1">
                  Max uses per individual renter (1 = once).
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-black text-xs tracking-wider uppercase mt-2 shadow-md shadow-emerald-50"
          >
            {createMutation.isPending
              ? 'Generating Voucher...'
              : 'Generate Coupon'}
          </Button>
        </form>
      </div>
    </div>
  )
}
