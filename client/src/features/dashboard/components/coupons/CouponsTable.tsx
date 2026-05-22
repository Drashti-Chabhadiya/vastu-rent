import { useState } from 'react'
import { Search, Plus, Copy, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { Coupon } from '#/hook/use-coupons'
import { cn } from '#/lib/utils'
import { getScenarioLabel, scenarioColorMap } from '#/lib/coupon-utils'

interface CouponsTableProps {
  coupons: Coupon[]
  isLoading: boolean
  isAdmin: boolean
  isOwner: boolean
  activeTab: 'my' | 'global'
  onDelete: (id: string) => void
  onCreateClick: () => void
}

export function CouponsTable({
  coupons,
  isLoading,
  isAdmin,
  isOwner,
  activeTab,
  onDelete,
  onCreateClick,
}: CouponsTableProps) {
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()),
  )

  const canManage = isAdmin || (isOwner && activeTab === 'my')

  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-[15px] font-black text-[#1e293b]">
            {isOwner && activeTab === 'global'
              ? 'Global Platform Promo Codes'
              : 'All Coupons'}
          </h3>
          <p className="text-[11px] font-bold text-slate-400">
            {isOwner && activeTab === 'global'
              ? 'Active voucher offers created by Vastu Rent Admins.'
              : 'View, query, and audit active/inactive discount policies.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-3 text-slate-400"
            />
            <Input
              placeholder="Search code..."
              className="h-10 pl-9 pr-4 w-44 bg-slate-50 border-none rounded-xl text-[11px] font-bold focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canManage && (
            <Button
              onClick={onCreateClick}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center gap-2"
            >
              <Plus size={14} /> Create Coupon
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full">
          <thead>
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Configuration</th>
              <th className="text-left px-4 py-3">Min. Booking</th>
              <th className="text-left px-4 py-3">Expiry</th>
              <th className="text-left px-4 py-3">Redeemed</th>
              {canManage && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-xs text-slate-400"
                >
                  Syncing coupon policies...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-xs text-slate-400"
                >
                  No vouchers available in this view.
                </td>
              </tr>
            ) : (
              filtered.map((coupon) => {
                const scenario = getScenarioLabel(
                  coupon.usageLimit,
                  coupon.perUserLimit,
                )
                const pct = coupon.usageLimit
                  ? Math.min(
                      (coupon.usedCount / coupon.usageLimit) * 100,
                      100,
                    )
                  : 10

                return (
                  <tr
                    key={coupon.id}
                    className="group hover:bg-slate-50/50 transition-all"
                  >
                    {/* Code */}
                    <td className="px-4 py-5">
                      <div className="inline-flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed bg-emerald-50 text-emerald-600 border-emerald-100">
                        <span className="text-[11px] font-black tracking-widest uppercase">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-1 text-[8px] font-bold mt-1 opacity-70 hover:opacity-100"
                        >
                          {copiedCode === coupon.code ? 'Copied!' : 'Copy'}{' '}
                          <Copy size={8} />
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-5">
                      <p className="text-[12px] font-black text-[#1e293b]">
                        {coupon.type === 'percentage'
                          ? `${coupon.discount}% OFF`
                          : `₹${coupon.discount} OFF`}
                      </p>
                      {coupon.maxDiscount && (
                        <p className="text-[9px] font-bold text-slate-400">
                          Upto ₹{coupon.maxDiscount}
                        </p>
                      )}
                    </td>

                    {/* Configuration */}
                    <td className="px-4 py-5 font-bold text-slate-500 text-[10px]">
                      <div className="flex flex-col gap-1.5 items-start">
                        {/* Scope */}
                        {coupon.product?.title ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Listing: {coupon.product.title}
                          </span>
                        ) : coupon.ownerId ? (
                          <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Owner Specific
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            Platform Wide
                          </span>
                        )}
                        {/* Scenario */}
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wide',
                            scenarioColorMap[scenario.color],
                          )}
                        >
                          {scenario.label}
                        </span>
                      </div>
                    </td>

                    {/* Min Booking */}
                    <td className="px-4 py-5 font-black text-[#1e293b] text-[11px]">
                      ₹{coupon.minBooking || '0'}
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-5">
                      <p className="text-[10px] font-black text-[#1e293b] leading-tight">
                        {new Date(coupon.endDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      {new Date(coupon.endDate) < new Date() && (
                        <span className="text-[9px] font-bold text-red-400">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Redeemed */}
                    <td className="px-4 py-5 min-w-[90px]">
                      <p className="text-[10px] font-black text-[#1e293b] mb-1">
                        {coupon.usedCount}
                        {coupon.usageLimit
                          ? ` / ${coupon.usageLimit}`
                          : ' used'}
                      </p>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            pct >= 90
                              ? 'bg-red-400'
                              : pct >= 60
                                ? 'bg-amber-400'
                                : 'bg-emerald-500',
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {coupon.perUserLimit && (
                        <p className="text-[8px] font-bold text-slate-400 mt-1">
                          Max {coupon.perUserLimit}× per user
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-4 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(coupon.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
