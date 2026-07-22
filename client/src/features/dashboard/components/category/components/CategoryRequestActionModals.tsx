import { useState } from 'react'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { Textarea } from '#/components/ui/textarea'
import { toast } from 'sonner'
import { useTranslation } from '#/context/TranslationContext'

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
  const { t } = useTranslation()
  const [rejectReason, setRejectReason] = useState('')

  const handleRejectConfirmClick = () => {
    if (!rejectReason.trim()) {
      toast.error(t('Rejection feedback is required'))
      return
    }
    onRejectConfirm(rejectReason)
    setRejectReason('')
  }

  const rejectionDescription = (
    <div className="space-y-4 text-left">
      <p className="text-xs text-muted-foreground/80 font-semibold mt-1">
        {t('State the reason for rejecting "{category}".').replace('{category}', rejectingRequest?.name)}
      </p>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
          {t('Rejection Feedback')}
        </label>
        <Textarea
          placeholder={t('State why this category is rejected (e.g. Duplicated category name, not relevant, etc.)')}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="min-h-[100px] rounded-xl border-border/30 bg-muted-light/50 focus-visible:ring-dash-brand text-foreground w-full p-3 text-sm"
          required
        />
      </div>
    </div>
  )

  const approvalDescription = approvingRequest
    ? t('Are you sure you want to approve and create the category "{category}"? This will automatically add it to the active category database catalog for all platform users.').replace('{category}', approvingRequest.name)
    : ''

  return (
    <>
      {/* Admin Rejection Dialog */}
      <ReusableAlertDialog
        isOpen={!!rejectingRequest}
        onOpenChange={(open) => !open && onRejectClose()}
        onConfirm={handleRejectConfirmClick}
        onCancel={onRejectClose}
        title={t('Reject Proposed Category')}
        description={rejectionDescription}
        confirmText={t('Reject Request')}
        cancelText={t('Cancel')}
        variant="danger"
        isPending={isPending}
        pendingText={t('Rejecting...')}
      />

      {/* Admin Approval Confirmation Dialog */}
      <ReusableAlertDialog
        isOpen={!!approvingRequest}
        onOpenChange={(open) => !open && onApproveClose()}
        onConfirm={onApproveConfirm}
        onCancel={onApproveClose}
        title={t('Approve Category Proposal')}
        description={approvalDescription}
        confirmText={t('Confirm Approval')}
        cancelText={t('Cancel')}
        variant="success"
        isPending={isPending}
        pendingText={t('Approving...')}
      />
    </>
  )
}
