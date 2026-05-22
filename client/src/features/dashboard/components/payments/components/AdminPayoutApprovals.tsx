import { useState } from 'react'
import { Zap } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'

interface AdminPayoutApprovalsProps {
  allAdminPayouts: any[]
  onAdminAction: (
    payoutId: string,
    actionType: 'approved' | 'rejected' | 'paid',
    notes: string,
    onSuccess: () => void
  ) => void
  isUpdating: boolean
}

export const AdminPayoutApprovals = ({
  allAdminPayouts,
  onAdminAction,
  isUpdating,
}: AdminPayoutApprovalsProps) => {
  const [selectedAdminPayout, setSelectedAdminPayout] = useState<any | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [adminActionType, setAdminActionType] = useState<
    'approved' | 'rejected' | 'paid' | null
  >(null)

  const activePayouts = allAdminPayouts?.filter(
    (p: any) => p.status === 'pending' || p.status === 'approved',
  ) || []

  if (activePayouts.length === 0) return null

  const handleConfirmAction = () => {
    if (!selectedAdminPayout || !adminActionType) return

    onAdminAction(
      selectedAdminPayout.id,
      adminActionType,
      adminNotes,
      () => {
        setSelectedAdminPayout(null)
        setAdminNotes('')
        setAdminActionType(null)
      }
    )
  }

  return (
    <div className="bg-[#faf7f0] border-2 border-emerald-600/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
      <div>
        <h3 className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Zap size={16} className="text-emerald-600" />
          Admin Payout Approvals Portal
        </h3>
        <p className="text-[11px] font-semibold text-slate-500">
          Review, approve or reject payout requests from listing listers.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePayouts.map((payout: any) => (
          <div
            key={payout.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {payout.owner?.image ? (
                    <img
                      src={payout.owner.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-200 uppercase text-sm">
                      {payout.owner?.name?.slice(0, 2) || 'OW'}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">
                    {payout.owner?.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]" title={payout.owner?.email}>
                    {payout.owner?.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#1e293b] block">
                  ₹{payout.amount.toLocaleString()}
                </span>
                <span className="text-[8px] font-bold text-slate-400 block">
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
                className="flex-1 h-9 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[10px] uppercase cursor-pointer"
              >
                Mark Paid
              </Button>
              <Button
                onClick={() => {
                  setSelectedAdminPayout(payout)
                  setAdminActionType('rejected')
                }}
                variant="outline"
                className="flex-1 h-9 rounded-xl text-red-500 border border-red-200 hover:bg-red-50 font-black text-[10px] uppercase cursor-pointer"
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
          <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">
                  Admin Action Portal
                </span>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {adminActionType === 'rejected'
                    ? 'Reject Payout Request'
                    : 'Approve & Mark as Paid'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Notes / Reason / Transaction ID
                </label>
                <textarea
                  placeholder={
                    adminActionType === 'rejected'
                      ? 'Enter rejection reason...'
                      : 'Enter transaction ID or payment notes...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-800 outline-none focus:border-[#059669] transition-all resize-none"
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
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-wider text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  className={`flex-1 h-12 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    adminActionType === 'rejected'
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                      : 'bg-[#059669] hover:bg-[#059669]/90 shadow-emerald-100'
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
