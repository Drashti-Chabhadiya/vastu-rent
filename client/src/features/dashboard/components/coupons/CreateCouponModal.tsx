import { useState } from 'react'
import {
  Info,
  Ticket,
  Users,
  Globe,
  ShieldCheck,
  Percent,
  Coins,
  Package,
  TrendingUp,
  ClipboardList,
  Calendar,
  Plus,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCreateCoupon, useMyListings } from '#/hook'
import { cn } from '#/lib/utils'
import { scenarioColorMap } from '#/lib/coupon-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Badge } from '#/components/ui/badge'
import { LoadingOverlay } from '#/components/ui/loader'

interface CreateCouponModalProps {
  isOpen: boolean
  isOwner: boolean
  isAdmin: boolean
  onClose: () => void
}

export function CreateCouponModal({
  isOpen,
  isOwner,
  isAdmin,
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
  const [productId, setProductId] = useState('all')
  const [perUserLimit, setPerUserLimit] = useState('')

  const resetForm = () => {
    setCode('')
    setDiscount('')
    setMaxDiscount('')
    setMinBooking('')
    setEndDate('')
    setUsageLimit('')
    setProductId('all')
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
        productId: productId && productId !== 'all' ? productId : undefined,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : undefined,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-card text-dash-text">
        <div className="bg-gradient-to-br from-primary to-primary-hover p-8 text-primary-foreground relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-card/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Ticket className="text-primary-foreground" size={24} />
              </div>
              <Badge className="bg-card/20 text-primary-foreground border-none font-bold text-[10px] uppercase tracking-widest hover:bg-card/20">
                Voucher Campaign
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-primary-foreground">
              Create Coupon
            </DialogTitle>
            <p className="text-primary-foreground/70 text-sm font-medium mt-1">
              Configure discount rules, limits, and scope for your voucher
              campaign.
            </p>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-foreground relative min-h-[300px]"
        >
          {createMutation.isPending && (
            <LoadingOverlay message="Generating coupon voucher..." />
          )}

          {/* Live scenario preview */}
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border transition-all shadow-sm',
              previewScenario.color,
            )}
          >
            <previewScenario.icon size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">
                Scenario Preview
              </p>
              <p className="text-[13px] font-bold mt-0.5">
                {previewScenario.label}
              </p>
            </div>
          </div>

          {/* Voucher code */}
          <div className="space-y-2.5">
            <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
              <Ticket size={14} className="text-dash-brand" />
              Voucher Code
            </label>
            <Input
              required
              placeholder="e.g. WELCOME50, FIRST100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-12 bg-card border-border rounded-xl text-[15px] placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-black uppercase tracking-widest text-dash-brand shadow-sm"
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Percent size={14} className="text-dash-brand" />
                Discount Type
              </label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="w-full h-12 border border-border rounded-xl px-4 bg-card text-[15px] font-medium text-foreground focus:ring-1 focus:ring-dash-brand/30 hover:bg-muted-light/50 transition-all shadow-sm">
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <SelectItem
                    value="percentage"
                    className="text-[14px] font-medium text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                  >
                    Percentage (%)
                  </SelectItem>
                  <SelectItem
                    value="fixed"
                    className="text-[14px] font-medium text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                  >
                    Fixed Flat (₹)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Coins size={14} className="text-dash-brand" />
                Discount Value
              </label>
              <Input
                required
                type="number"
                placeholder="e.g. 10 or 150"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Target listing (owners only) */}
          {isOwner && myListings && myListings.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Package size={14} className="text-dash-brand" />
                Applicable Listing
              </label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full h-12 border border-border rounded-xl px-4 bg-card text-[15px] font-medium text-foreground focus:ring-1 focus:ring-dash-brand/30 hover:bg-muted-light/50 transition-all shadow-sm">
                  <SelectValue placeholder="All My Listings" />
                </SelectTrigger>
                <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-[200px]">
                  <SelectItem
                    value="all"
                    className="text-[14px] font-medium text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                  >
                    All My Listings
                  </SelectItem>
                  {myListings.map((p: any) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="text-[14px] font-medium text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                    >
                      {p.title || p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Max discount + Min booking */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <TrendingUp size={14} className="text-dash-brand" />
                Max Discount (₹)
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <ClipboardList size={14} className="text-dash-brand" />
                Min Booking (₹)
              </label>
              <Input
                type="number"
                placeholder="None"
                value={minBooking}
                onChange={(e) => setMinBooking(e.target.value)}
                className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-2.5">
            <label className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
              <Calendar size={14} className="text-dash-brand" />
              Expiry Date
            </label>
            <Input
              required
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
            />
          </div>

          {/* Redemption Limits */}
          <div className="pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Info size={14} className="text-dash-brand" />
              <p className="text-[13px] font-bold text-foreground">
                Redemption Limits
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-muted-foreground/85 ml-1 flex items-center gap-2">
                  <Globe size={13} className="text-muted-foreground/70" />
                  Global Limit (FCFS)
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="∞ Unlimited"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
                <p className="text-[10px] text-muted-foreground/70 font-medium ml-1">
                  Total times anyone can use this code.
                </p>
              </div>
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-muted-foreground/85 ml-1 flex items-center gap-2">
                  <Users size={13} className="text-muted-foreground/70" />
                  Per-User Limit
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="∞ Unlimited"
                  value={perUserLimit}
                  onChange={(e) => setPerUserLimit(e.target.value)}
                  className="h-12 bg-card border-border rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
                <p className="text-[10px] text-muted-foreground/70 font-medium ml-1">
                  Max uses per individual renter (1 = once).
                </p>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm font-medium">
              Coupon requests from non-admin users will be reviewed by an admin and activated after approval.
            </div>
          )}
          <DialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-border/30">
            <Button
              type="button"
              onClick={handleClose}
              className="rounded-full font-bold h-12 flex-1 bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-full h-12 font-extrabold px-8 shadow-lg shadow-dash-brand/20 flex-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              {createMutation.isPending ? 'Generating...' : 'Generate Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
