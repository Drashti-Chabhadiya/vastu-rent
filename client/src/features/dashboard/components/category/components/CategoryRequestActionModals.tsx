import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '#/components/ui/button'

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

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectReason.trim()) return
    onRejectConfirm(rejectReason)
    setRejectReason('')
  }

  return (
    <>
      {/* Admin Rejection Dialog */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRejectClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full h-8 w-8 active:scale-[0.98] transition-all cursor-pointer"
            >
              <X size={20} />
            </Button>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Reject Proposed Category
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              State the reason for rejecting "{rejectingRequest.name}".
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Rejection Feedback
                </label>
                <textarea
                  placeholder="State why this category is rejected (e.g. Duplicated category name, not relevant, etc.)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 h-28 focus:ring-1 focus:ring-dash-brand text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRejectClose}
                  className="rounded-xl h-12 px-6 font-bold cursor-pointer active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold cursor-pointer active:scale-[0.98] transition-all"
                >
                  {isPending ? 'Rejecting...' : 'Reject Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Approval Confirmation Dialog */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onApproveClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full h-8 w-8 active:scale-[0.98] transition-all cursor-pointer"
            >
              <X size={20} />
            </Button>

            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600 border border-green-100">
              <Check size={28} />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Approve Category Proposal
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to approve and create the category{' '}
              <strong className="text-gray-900">
                "{approvingRequest.name}"
              </strong>
              ? This will automatically add it to the active category database
              catalog for all platform users.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onApproveClose}
                className="rounded-xl h-12 px-6 font-bold cursor-pointer active:scale-[0.98] transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={onApproveConfirm}
                disabled={isPending}
                className="bg-[#15803d] hover:bg-[#166534] text-white rounded-xl h-12 px-6 font-bold cursor-pointer active:scale-[0.98] transition-all"
              >
                {isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
