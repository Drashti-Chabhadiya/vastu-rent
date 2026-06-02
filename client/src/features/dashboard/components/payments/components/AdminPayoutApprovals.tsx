import { useState } from 'react'
import { Zap } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { Dialog, DialogContent } from '#/components/ui/dialog'

interface AdminPayoutApprovalsProps {
  allAdminPayouts: any[]
  onAdminAction: (
    payoutId: string,
    actionType: 'approved' | 'rejected' | 'paid',
    notes: string,
    onSuccess: () => void,
  ) => void
  isUpdating: boolean
}

export const AdminPayoutApprovals = ({
  allAdminPayouts,
  onAdminAction,
  isUpdating,
}: AdminPayoutApprovalsProps) => {
  const [selectedAdminPayout, setSelectedAdminPayout] = useState<any | null>(
    null,
  )
  const [adminNotes, setAdminNotes] = useState('')
  const [adminActionType, setAdminActionType] = useState<
    'approved' | 'rejected' | 'paid' | null
  >(null)

  const activePayouts =
    allAdminPayouts?.filter(
      (p: any) => p.status === 'pending' || p.status === 'approved',
    ) || []

  if (activePayouts.length === 0) return null

  const handleConfirmAction = () => {
    if (!selectedAdminPayout || !adminActionType) return

    onAdminAction(selectedAdminPayout.id, adminActionType, adminNotes, () => {
      setSelectedAdminPayout(null)
      setAdminNotes('')
      setAdminActionType(null)
    })
  }

  return (
    <div className="bg-background border-2 border-dash-brand/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
      <div>
        <h3 className="text-[15px] font-extrabold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
          <Zap size={16} className="text-dash-brand" />
          Admin Payout Approvals Portal
        </h3>
        <p className="text-[11px] font-semibold text-muted-foreground/85">
          Review, approve or reject payout requests from listing listers.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePayouts.map((payout: any) => (
          <div
            key={payout.id}
            className="bg-card p-5 rounded-2xl border border-border/30 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 overflow-hidden flex-shrink-0">
                  {payout.owner?.image ? (
                    <img
                      src={payout.owner.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/85 bg-muted uppercase text-sm">
                      {payout.owner?.name?.slice(0, 2) || 'OW'}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-foreground/90">
                    {payout.owner?.name}
                  </h4>
                  <p
                    className="text-[10px] text-muted-dark font-bold truncate max-w-[120px]"
                    title={payout.owner?.email}
                  >
                    {payout.owner?.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-foreground block">
                  ₹{payout.amount.toLocaleString()}
                </span>
                <span className="text-[8px] font-bold text-muted-dark block">
                  {format(new Date(payout.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedAdminPayout(payout)
                  setAdminActionType('paid')
                }}
                className="flex-1 h-9 rounded-full bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[10px] uppercase shadow-md shadow-dash-brand/10 transition-all active:scale-[0.98] cursor-pointer"
              >
                Mark Paid
              </Button>
              <Button
                onClick={() => {
                  setSelectedAdminPayout(payout)
                  setAdminActionType('rejected')
                }}
                variant="outline"
                className="flex-1 h-9 rounded-full text-destructive border border-danger/50 hover:bg-danger font-black text-[10px] uppercase transition-all active:scale-[0.98] cursor-pointer"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN PROCESS ACTION DIALOG MODAL */}
      <Dialog
        open={!!selectedAdminPayout}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAdminPayout(null)
            setAdminNotes('')
            setAdminActionType(null)
          }
        }}
      >
        {selectedAdminPayout && (
          <DialogContent className="max-w-md p-8 border-none bg-card rounded-[2.5rem] shadow-2xl font-sans">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-dash-brand bg-dash-brand/5 px-2 py-0.5 rounded">
                  Admin Action Portal
                </span>
                <h3 className="text-xl font-extrabold text-foreground/90">
                  {adminActionType === 'rejected'
                    ? 'Reject Payout Request'
                    : 'Approve & Mark as Paid'}
                </h3>
                <p className="text-[11px] font-bold text-muted-dark">
                  Request by <strong>{selectedAdminPayout.owner?.name}</strong>{' '}
                  for{' '}
                  <strong>
                    ₹{selectedAdminPayout.amount.toLocaleString()}
                  </strong>
                  .
                </p>
              </div>

              {/* Action Notes Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                  Notes / Reason / Transaction ID
                </label>
                <Textarea
                  placeholder={
                    adminActionType === 'rejected'
                      ? 'Enter rejection reason...'
                      : 'Enter transaction ID or payment notes...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-xl border border-border/30 bg-muted-light/50 text-xs font-semibold text-foreground/90 outline-none focus:border-dash-brand transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSelectedAdminPayout(null)
                    setAdminNotes('')
                    setAdminActionType(null)
                  }}
                  className="flex-1 h-12 rounded-full font-black text-[11px] uppercase tracking-wider bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  className={`flex-1 h-12 rounded-full text-primary-foreground font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                    adminActionType === 'rejected'
                      ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/5'
                      : 'bg-dash-brand hover:bg-dash-brand/90 shadow-dash-brand/20'
                  }`}
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? 'Updating...'
                    : adminActionType === 'rejected'
                      ? 'Confirm Reject'
                      : 'Confirm Pay'}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
