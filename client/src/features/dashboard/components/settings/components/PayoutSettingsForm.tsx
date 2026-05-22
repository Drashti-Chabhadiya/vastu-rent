import { AlertCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

interface PayoutSettingsFormProps {
  upiId: string
  setUpiId: (id: string) => void
  accountHolder: string
  setAccountHolder: (holder: string) => void
  bankName: string
  setBankName: (name: string) => void
  accountNumber: string
  setAccountNumber: (num: string) => void
  ifscCode: string
  setIfscCode: (code: string) => void
  handleSaveBankDetails: (e: React.FormEvent) => void
}

export const PayoutSettingsForm = ({
  upiId,
  setUpiId,
  accountHolder,
  setAccountHolder,
  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
  ifscCode,
  setIfscCode,
  handleSaveBankDetails,
}: PayoutSettingsFormProps) => {
  return (
    <form onSubmit={handleSaveBankDetails} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-black text-slate-800">
            Payout Settlements
          </h3>
          <p className="text-[11px] font-bold text-slate-400">
            Configure bank accounts or UPI IDs to receive earnings settlements.
          </p>
        </div>
        <Button
          type="submit"
          className="bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] px-6 h-11 rounded-xl transition-all shadow-sm active:scale-95"
        >
          Save Payout Details
        </Button>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
          Settlements are processed via bank accounts or UPI within 24-48 hours of approved payout withdrawal requests. Ensure details are fully accurate.
        </p>
      </div>

      {/* UPI Option */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            UPI ID / Address (Recommended)
          </label>
          <Input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. name@upi"
            className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">
            Or Bank Account Transfer
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Account Holder Name
              </label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Enter bank account name"
                className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Bank Name
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Account Number
              </label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter Account Number"
                className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                IFSC Code
              </label>
              <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0000123"
                className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
