import { useState } from 'react'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { Textarea } from '#/components/ui/textarea'
import { toast } from 'sonner'

interface CategoryRequestActionModalsProps {
  rejectingRequest: any
  onRejectClose: () => void
  onRejectConfirm: (reason: string) => void

  approvingRequest: any
  onApproveClose: () => void
  onApproveConfirm: () => void

  isPending: boolean
}

export const CategoryRequestActionModals = ({
  rejectingRequest,
  onRejectClose,
  onRejectConfirm,
  approvingRequest,
  onApproveClose,
  onApproveConfirm,
  isPending,
}: CategoryRequestActionModalsProps) => {
  const [rejectReason, setRejectReason] = useState('')

  const handleRejectConfirmClick = () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection feedback is required')
      return
    }
    onRejectConfirm(rejectReason)
    setRejectReason('')
  }

  const rejectionDescription = (
    <div className="space-y-4 text-left">
      <p className="text-xs text-muted-foreground/80 font-semibold mt-1">
        State the reason for rejecting "{rejectingRequest?.name}".
      </p>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
          Rejection Feedback
        </label>
        <Textarea
          placeholder="State why this category is rejected (e.g. Duplicated category name, not relevant, etc.)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="min-h-[100px] rounded-xl border-border/30 bg-muted-light/50 focus-visible:ring-dash-brand text-foreground w-full p-3 text-sm"
          required
        />
      </div>
    </div>
  )

  const approvalDescription = approvingRequest
    ? `Are you sure you want to approve and create the category "${approvingRequest.name}"? This will automatically add it to the active category database catalog for all platform users.`
    : ''

  return (
    <>
      {/* Admin Rejection Dialog */}
      <ReusableAlertDialog
        isOpen={!!rejectingRequest}
        onOpenChange={(open) => !open && onRejectClose()}
        onConfirm={handleRejectConfirmClick}
        onCancel={onRejectClose}
        title="Reject Proposed Category"
        description={rejectionDescription}
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
        title="Approve Category Proposal"
        description={approvalDescription}
        confirmText="Confirm Approval"
        cancelText="Cancel"
        variant="success"
        isPending={isPending}
        pendingText="Approving..."
      />
    </>
  )
}
