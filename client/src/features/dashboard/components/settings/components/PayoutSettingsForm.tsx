import {
  AlertCircle,
  Smartphone,
  User,
  Building2,
  CreditCard,
  Key,
  Pencil,
  Save,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { usePayoutSettingsStore } from '../../../../../store/usePayoutSettingsStore'
import { useTranslation } from '#/context/TranslationContext'

interface PayoutSettingsFormProps {
  handleSaveBankDetails: (e: React.FormEvent) => void
  isSaving: boolean
  activeUser: any
}

export const PayoutSettingsForm = ({
  handleSaveBankDetails,
  isSaving,
  activeUser,
}: PayoutSettingsFormProps) => {
  const { t } = useTranslation()
  const {
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
    hasChanges: checkHasChanges,
  } = usePayoutSettingsStore()

  const hasChanges = checkHasChanges(activeUser)

  return (
    <form
      onSubmit={handleSaveBankDetails}
      className="space-y-8 animate-in fade-in duration-300"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/10">
        <div>
          <h3 className="text-xl font-extrabold text-dash-brand font-display tracking-tight leading-none">
            {t('Payout Settlements')}
          </h3>
          <p className="text-[12px] font-semibold text-muted-dark mt-2">
            {t(
              'Configure bank accounts or UPI IDs to receive earnings settlements.',
            )}
          </p>
        </div>
        <Button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-[12px] px-6 h-11 text-xs font-black flex items-center gap-2 shadow-md shadow-dash-brand/10 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dash-brand"
        >
          <Save size={13} />
          {isSaving ? t('Saving...') : t('Save Changes')}
        </Button>
      </div>

      {/* Styled Bottom Alert */}
      <div className="bg-warning/5 border border-warning/10 rounded-2xl p-4.5 flex items-start gap-3.5 mt-8">
        <div className="w-9 h-9 rounded-full bg-warning/10 text-warning-foreground flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle size={18} />
        </div>
        <div>
          <span className="text-sm font-bold text-warning-foreground block">
            {t('Verify Payout Details')}
          </span>
          <span className="text-xs text-slate-600 block mt-1 font-semibold leading-relaxed">
            {t(
              'Settlements are processed via bank accounts or UPI within 24-48 hours of approved payout withdrawal requests. Ensure details are fully accurate.',
            )}
          </span>
        </div>
      </div>

      {/* UPI Option */}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            {t('UPI ID / Address (Recommended)')}
          </label>
          <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                <Smartphone size={16} />
              </div>
              <Input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@upi"
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6">
          <h4 className="text-xs font-black text-foreground/90 mb-6 uppercase tracking-wider">
            {t('Or Bank Account Transfer')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Holder Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                {t('Account Holder Name')}
              </label>
              <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <Input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Enter bank account name"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
                  />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
                  <Pencil size={12} />
                </div>
              </div>
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                {t('Bank Name')}
              </label>
              <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <Input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
                  />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
                  <Pencil size={12} />
                </div>
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                {t('Account Number')}
              </label>
              <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <Input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter Account Number"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
                  />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
                  <Pencil size={12} />
                </div>
              </div>
            </div>

            {/* IFSC Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                {t('IFSC Code')}
              </label>
              <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                    <Key size={16} />
                  </div>
                  <Input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. HDFC0000123"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
                  />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
                  <Pencil size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
