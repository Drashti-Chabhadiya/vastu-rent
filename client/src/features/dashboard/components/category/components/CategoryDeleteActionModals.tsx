import * as LucideIcons from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'

interface CategoryDeleteActionModalsProps {
  rejectingRequest: any
  onRejectClose: () => void
  onRejectConfirm: () => void

  approvingRequest: any
  onApproveClose: () => void
  onApproveConfirm: () => void

  isPending: boolean
}

export const CategoryDeleteActionModals = ({
  rejectingRequest,
  onRejectClose,
  onRejectConfirm,
  approvingRequest,
  onApproveClose,
  onApproveConfirm,
  isPending,
}: CategoryDeleteActionModalsProps) => {
  const renderRequestDetails = (req: any, type: 'approve' | 'reject') => {
    if (!req) return null
    const categoryName =
      req.categoryName || req.category?.name || 'Unknown Category'
    const categoryIcon = req.categoryIcon || req.category?.icon || 'Folder'
    const categoryColor = req.categoryColor || req.category?.color || '#3b82f6'
    const categoryImage = req.category?.image
    const proposerName = req.user?.name || req.user?.email || 'Unknown User'
    const categoryCreatedAt = req.category?.createdAt
      ? new Date(req.category.createdAt).toLocaleDateString()
      : 'Unknown Date'

    const productsCount = req.productsCount || 0
    const listingsUsersCount = req.listingsUsersCount || 0
    const rentalsCount = req.rentalsCount || 0
    const distinctRentersCount = req.distinctRentersCount || 0
    const sampleProducts = req.sampleProducts || []

    const Icon = (LucideIcons as any)[categoryIcon] || LucideIcons.Folder

    return (
      <div className="space-y-4 text-left mt-2 max-h-[60vh] overflow-y-auto pr-1">
        {/* Category Details Card */}
        <div className="flex items-center gap-3 bg-muted-light/40 border border-border/20 p-3.5 rounded-xl">
          {categoryImage ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/30 flex-shrink-0">
              <img
                src={categoryImage}
                alt={categoryName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as any).src =
                    'https://via.placeholder.com/100?text=Category'
                }}
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block mb-0.5">
              Category to Delete
            </span>
            <h5 className="font-extrabold text-foreground text-sm truncate">
              {categoryName}
            </h5>
          </div>
        </div>

        {/* Request & Category Metadata */}
        <div className="space-y-2.5 bg-muted-light/25 border border-border/15 p-3.5 rounded-xl text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-border/10">
            <span className="text-muted-foreground font-semibold">
              Requested By
            </span>
            <span className="font-bold text-foreground">{proposerName}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border/10">
            <span className="text-muted-foreground font-semibold">
              Request Date
            </span>
            <span className="font-bold text-foreground">
              {new Date(req.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border/10">
            <span className="text-muted-foreground font-semibold">
              Category Created
            </span>
            <span className="font-bold text-foreground">
              {categoryCreatedAt}
            </span>
          </div>

          {req.reason && (
            <div className="space-y-1 pt-1.5">
              <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
                Reason for Deletion
              </span>
              <p className="italic text-muted-foreground/90 bg-danger/5 border border-danger/10 px-3 py-2 rounded-lg leading-relaxed">
                "{req.reason}"
              </p>
            </div>
          )}
        </div>

        {/* Category Usage Stats Grid */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
            Category Usage Stats
          </span>
          <div className="grid grid-cols-2 gap-2 bg-muted-light/20 border border-border/10 p-3 rounded-xl">
            <div className="bg-card border border-border/20 p-2.5 rounded-lg text-center shadow-xs">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">
                Total Listings
              </span>
              <span className="text-sm font-black text-foreground">
                {productsCount}
              </span>
            </div>
            <div className="bg-card border border-border/20 p-2.5 rounded-lg text-center shadow-xs">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">
                Listing Owners
              </span>
              <span className="text-sm font-black text-foreground">
                {listingsUsersCount}
              </span>
            </div>
            <div className="bg-card border border-border/20 p-2.5 rounded-lg text-center shadow-xs">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">
                Total Bookings
              </span>
              <span className="text-sm font-black text-foreground">
                {rentalsCount}
              </span>
            </div>
            <div className="bg-card border border-border/20 p-2.5 rounded-lg text-center shadow-xs">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">
                Renter Users
              </span>
              <span className="text-sm font-black text-foreground">
                {distinctRentersCount}
              </span>
            </div>
          </div>
        </div>

        {/* Linked Listings Sample */}
        {sampleProducts.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider">
                Linked Listings (Sample)
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold">
                Showing {sampleProducts.length} of {productsCount}
              </span>
            </div>
            <div className="bg-muted-light/20 border border-border/10 rounded-xl overflow-hidden divide-y divide-border/10">
              {sampleProducts.map((prod: any) => (
                <div
                  key={prod.id}
                  className="p-2.5 flex justify-between items-center gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-foreground truncate block">
                      {prod.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground truncate block">
                      Owner: {prod.user?.name || prod.user?.email || 'Unknown'}
                    </span>
                  </div>
                  <span className="font-black text-primary flex-shrink-0 bg-primary-soft/30 px-2 py-0.5 rounded text-[10px]">
                    ₹{prod.price}/day
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Prompt Note */}
        <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-medium px-1">
          {type === 'approve'
            ? 'Approving this deletion request will grant the user temporary permission to delete the category within a 24-hour window. The category will not be deleted immediately.'
            : 'Are you sure you want to reject this category deletion request? The category will remain active.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Admin Rejection Dialog */}
      <ReusableAlertDialog
        isOpen={!!rejectingRequest}
        onOpenChange={(open) => !open && onRejectClose()}
        onConfirm={onRejectConfirm}
        onCancel={onRejectClose}
        title="Reject Deletion Request"
        description={renderRequestDetails(rejectingRequest, 'reject')}
        confirmText="Reject Request"
        cancelText="Cancel"
        variant="danger"
        isPending={isPending}
        pendingText="Rejecting..."
      />

      {/* Admin Approval Confirmation Dialog */}
      <ReusableAlertDialog
        isOpen={!!approvingRequest}
        onOpenChange={(open) => !open && onApproveClose()}
        onConfirm={onApproveConfirm}
        onCancel={onApproveClose}
        title="Approve Deletion Request"
        description={renderRequestDetails(approvingRequest, 'approve')}
        confirmText="Approve Request"
        cancelText="Cancel"
        variant="success"
        icon={Trash2}
        isPending={isPending}
        pendingText="Approving..."
      />
    </>
  )
}
