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
  onApprove?: (id: string) => void
  onCreateClick: () => void
}

export function CouponsTable({
  coupons,
  isLoading,
  isAdmin,
  isOwner,
  activeTab,
  onDelete,
  onApprove,
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
    <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-[15px] font-black text-foreground">
            {isOwner && activeTab === 'global'
              ? 'Global Platform Promo Codes'
              : 'All Coupons'}
          </h3>
          <p className="text-[11px] font-bold text-muted-dark">
            {isOwner && activeTab === 'global'
              ? 'Active voucher offers created by Vastu Rent Admins.'
              : 'View, query, and audit active/inactive discount policies.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-3 text-muted-dark"
            />
            <Input
              placeholder="Search code..."
              className="h-10 pl-9 pr-4 w-44 bg-muted-light border-none rounded-xl text-[11px] font-bold focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canManage && (
            <Button
              onClick={onCreateClick}
              className="h-10 px-4 rounded-full bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[11px] flex items-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-dash-brand/10"
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
            <tr className="text-[9px] font-black text-muted-dark uppercase tracking-widest border-b border-border/30">
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Configuration</th>
              <th className="text-left px-4 py-3">Min. Booking</th>
              <th className="text-left px-4 py-3">Expiry</th>
              <th className="text-left px-4 py-3">Redeemed</th>
              {canManage && <th className="text-left px-4 py-3">Status</th>}
              {canManage && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-xs text-muted-dark"
                >
                  Syncing coupon policies...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-xs text-muted-dark"
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
                  ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)
                  : 10

                return (
                  <tr
                    key={coupon.id}
                    className="group hover:bg-muted-light/50 transition-all"
                  >
                    {/* Code */}
                    <td className="px-4 py-5">
                      <div className="inline-flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed bg-emerald-50 text-emerald-600 border-emerald-100">
                        <span className="text-[11px] font-black tracking-widest uppercase">
                          {coupon.code}
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-1 text-[8px] font-bold mt-1 opacity-70 hover:opacity-100 p-0 h-auto font-sans active:scale-[0.98] transition-all hover:bg-transparent"
                        >
                          {copiedCode === coupon.code ? 'Copied!' : 'Copy'}{' '}
                          <Copy size={8} />
                        </Button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-5">
                      <p className="text-[12px] font-black text-foreground">
                        {coupon.type === 'percentage'
                          ? `${coupon.discount}% OFF`
                          : `₹${coupon.discount} OFF`}
                      </p>
                      {coupon.maxDiscount && (
                        <p className="text-[9px] font-bold text-muted-dark">
                          Upto ₹{coupon.maxDiscount}
                        </p>
                      )}
                    </td>

                    {/* Configuration */}
                    <td className="px-4 py-5 font-bold text-muted-foreground/85 text-[10px]">
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
                          <span className="text-muted-foreground/85 bg-muted-light px-2 py-0.5 rounded border border-border/30">
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
                    <td className="px-4 py-5 font-black text-foreground text-[11px]">
                      ₹{coupon.minBooking || '0'}
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-5">
                      <p className="text-[10px] font-black text-foreground leading-tight">
                        {new Date(coupon.endDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      {new Date(coupon.endDate) < new Date() && (
                        <span className="text-[9px] font-bold text-destructive/80">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Redeemed */}
                    <td className="px-4 py-5 min-w-[90px]">
                      <p className="text-[10px] font-black text-foreground mb-1">
                        {coupon.usedCount}
                        {coupon.usageLimit
                          ? ` / ${coupon.usageLimit}`
                          : ' used'}
                      </p>
                      <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            pct >= 90
                              ? 'bg-destructive/80'
                              : pct >= 60
                                ? 'bg-amber-400'
                                : 'bg-emerald-500',
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {coupon.perUserLimit && (
                        <p className="text-[8px] font-bold text-muted-dark mt-1">
                          Max {coupon.perUserLimit}× per user
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    {canManage && (
                      <td className="px-4 py-5">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em]',
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100',
                          )}
                        >
                          {coupon.isActive ? 'Active' : 'Pending Approval'}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    {canManage && (
                      <td className="px-4 py-5 text-right flex flex-wrap justify-end gap-2">
                        {!coupon.isActive && onApprove && isAdmin && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onApprove(coupon.id)}
                            className="rounded-full font-bold h-9 px-3 text-[11px]"
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(coupon.id)}
                          className="h-8 w-8 text-muted-dark hover:text-destructive hover:bg-danger rounded-xl active:scale-[0.98] transition-all"
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
