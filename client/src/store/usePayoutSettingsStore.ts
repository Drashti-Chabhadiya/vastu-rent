import { create } from 'zustand'

export interface PayoutSettingsState {
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  accountHolder: string

  setBankName: (bankName: string) => void
  setAccountNumber: (accountNumber: string) => void
  setIfscCode: (ifscCode: string) => void
  setUpiId: (upiId: string) => void
  setAccountHolder: (accountHolder: string) => void

  initialize: (activeUser: any) => void
  hasChanges: (activeUser: any) => boolean
}

export const usePayoutSettingsStore = create<PayoutSettingsState>(
  (set, get) => ({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    accountHolder: '',

    setBankName: (bankName) => set({ bankName }),
    setAccountNumber: (accountNumber) => set({ accountNumber }),
    setIfscCode: (ifscCode) => set({ ifscCode }),
    setUpiId: (upiId) => set({ upiId }),
    setAccountHolder: (accountHolder) => set({ accountHolder }),

    initialize: (activeUser) => {
      if (!activeUser) return
      set({
        bankName: activeUser.bankName || '',
        accountNumber: activeUser.accountNumber || '',
        ifscCode: activeUser.ifscCode || '',
        upiId: activeUser.upiId || '',
        accountHolder: activeUser.accountHolder || activeUser.name || '',
      })
    },

    hasChanges: (activeUser) => {
      if (!activeUser) return false
      const state = get()

      const initialBankName = activeUser.bankName || ''
      const initialAccountNumber = activeUser.accountNumber || ''
      const initialIfscCode = activeUser.ifscCode || ''
      const initialUpiId = activeUser.upiId || ''
      const initialAccountHolder =
        activeUser.accountHolder || activeUser.name || ''

      return (
        state.upiId !== initialUpiId ||
        state.accountHolder !== initialAccountHolder ||
        state.bankName !== initialBankName ||
        state.accountNumber !== initialAccountNumber ||
        state.ifscCode !== initialIfscCode
      )
    },
  }),
)
