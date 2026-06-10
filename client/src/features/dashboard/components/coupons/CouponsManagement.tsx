import { useState } from 'react'
import { ChevronRight, Ticket, Zap, Grid } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useCoupons, useDeleteCoupon, useApproveCoupon } from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { cn } from '#/lib/utils'
import { CouponRenterView } from './CouponRenterView'
import { CouponsTable } from './CouponsTable'
import { CouponSidebar } from './CouponSidebar'
import { CreateCouponModal } from './CreateCouponModal'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'

interface CouponsManagementProps {
  isRenterView?: boolean
}

export const CouponsManagement = ({ isRenterView }: CouponsManagementProps) => {
  const { data: coupons, isLoading } = useCoupons()
  const deleteMutation = useDeleteCoupon()
  const approveMutation = useApproveCoupon()

  const { data: session } = authClient.useSession()
  const user = session?.user
  const role = user?.role || 'user'
  const isAdmin = role === 'admin'
  const isUser = role === 'user'
  const renderAsRenter = isRenterView

  const [activeTab, setActiveTab] = useState<'my' | 'global'>('my')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ── Renter: filter active, non-expired, non-exhausted coupons ──
  const renterCoupons = (() => {
    if (!coupons) return []
    const now = new Date()
    return coupons.filter((c) => {
      const limitReached = c.usageLimit ? c.usedCount >= c.usageLimit : false
      return c.isActive && new Date(c.endDate) >= now && !limitReached
    })
  })()

  // ── Admin/User: filter by tab ──
  const dashboardCoupons = (() => {
    if (!coupons) return []
    if (isAdmin) return coupons
    if (isUser) {
      return activeTab === 'my'
        ? coupons.filter((c) => c.userId === user?.id)
        : coupons.filter((c) => c.userId === null)
    }
    return coupons
  })()

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  // ── Renter View ───────────────────────────────────────────────
  if (renderAsRenter) {
    return (
      <div className="space-y-6">
        <CouponRenterView coupons={renterCoupons} isLoading={isLoading} />
      </div>
    )
  }

  // ── Admin / User Stats ───────────────────────────────────────
  const adminStats = [
    {
      label: 'Active Coupons',
      value:
        coupons?.filter((c) => c.isActive && new Date(c.endDate) >= new Date())
          .length || 0,
      icon: Ticket,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Pending Approval',
      value:
        coupons?.filter((c) => !c.isActive && new Date(c.endDate) >= new Date())
          .length || 0,
      icon: Zap,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Total Generated',
      value: coupons?.length || 0,
      icon: Grid,
      color: 'bg-warning text-warning-foreground border-amber-100',
    },
  ]

  // ── Dashboard View ────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-dark">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-muted-dark" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">
            Coupons Management
          </span>
        </div>
        <h1 className="text-xl font-black text-foreground">Coupons</h1>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={i}
                className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold text-muted-dark uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-foreground/90 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center border',
                    stat.color,
                  )}
                >
                  <Icon size={20} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* User Tabs */}
      {isUser && (
        <div className="flex items-center gap-2 border-b border-border/30 pb-px">
          {(['my', 'global'] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-2 rounded-none hover:bg-transparent h-auto active:scale-[0.98] cursor-pointer',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-dark hover:text-muted-foreground',
              )}
            >
              {tab === 'my' ? 'My Listings Coupons' : 'Platform Wide Coupons'}
            </Button>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CouponsTable
          coupons={dashboardCoupons}
          isLoading={isLoading}
          isAdmin={isAdmin}
          isUser={isUser}
          activeTab={activeTab}
          onDelete={handleDelete}
          onApprove={(id) => approveMutation.mutate(id)}
          onCreateClick={() => setIsFormOpen(true)}
        />

        <CouponSidebar
          isAdmin={isAdmin}
          isUser={isUser}
          activeTab={activeTab}
          onCreateClick={() => setIsFormOpen(true)}
        />
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isFormOpen}
        isAdmin={isAdmin}
        isUser={isUser}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirmation Alert Dialog */}
      <ReusableAlertDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteMutation.mutateAsync(deleteId)
              setDeleteId(null)
            } catch (err) {
              console.error(err)
            }
          }
        }}
      />
    </div>
  )
}
