import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'

interface WithdrawalRequestModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  withdrawableBalance: number
  session: any
  onRequestSubmit: (amount: number, onSuccess: () => void) => void
  isPending: boolean
}

export const WithdrawalRequestModal = ({
  isOpen,
  onOpenChange,
  withdrawableBalance,
  session,
  onRequestSubmit,
  isPending,
}: WithdrawalRequestModalProps) => {
  const [payoutAmount, setPayoutAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(payoutAmount)

    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payout amount')
      return
    }

    if (amt > withdrawableBalance) {
      toast.error(
        `Insufficient balance! Your maximum withdrawable balance is ₹${withdrawableBalance.toLocaleString()}`,
      )
      return
    }

    onRequestSubmit(amt, () => {
      setPayoutAmount('')
    })
  }

  const hasPayoutMethod =
    session?.user &&
    ((session.user).upiId || (session.user).bankName)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-dash-brand bg-dash-brand/5 px-2 py-0.5 rounded">
              Initiate Settlement
            </span>
            <h3 className="text-xl font-extrabold text-slate-800">
              Request Payout
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              Amount will be reviewed by admin and settled directly to your
              registered bank account/UPI within 24-48 hours.
            </p>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Withdrawal Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">
                ₹
              </span>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full h-14 pl-8 pr-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-black text-slate-800 outline-none focus:border-dash-brand focus:bg-white transition-all"
                max={withdrawableBalance}
                required
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 block pt-1">
              Max withdrawable:{' '}
              <strong className="text-dash-brand font-black">
                ₹{withdrawableBalance.toLocaleString()}
              </strong>
            </span>

            {hasPayoutMethod ? (
              <span className="text-[9px] font-bold text-dash-brand block mt-2 bg-dash-brand/5 p-2.5 rounded-xl border border-dash-brand/10">
                Direct transfer to:{' '}
                {(session.user).upiId
                  ? `UPI: ${(session.user).upiId}`
                  : `${(session.user).bankName} (A/C: *${(session.user).accountNumber?.slice(-4)})`}
              </span>
            ) : (
              <span className="text-[9px] font-bold text-amber-600 block mt-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                ⚠️ No active payout method set! Set your UPI / Bank account
                details in the{' '}
                <strong className="font-black underline">Settings</strong> tab
                to ensure direct settlement.
              </span>
            )}
          </div>

          {/* Platform notice */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
              By requesting this withdrawal, you authorize standard 10% platform
              fee calculations against your gross earnings bookings database.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-full font-black text-[11px] uppercase tracking-wider bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-full bg-dash-brand hover:bg-dash-brand/90 text-white font-black text-[11px] uppercase tracking-wider shadow-lg shadow-dash-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending ? 'Requesting...' : 'Request Payout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
