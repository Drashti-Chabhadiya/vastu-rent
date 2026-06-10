import { create } from 'zustand'

export interface AppliedCoupon {
  id: string
  code: string
  discountAmount: number
}

export interface ProductBookingState {
  calMonth: number
  calYear: number
  startDate: Date | null
  endDate: Date | null
  paymentMethod: 'online' | 'cash'
  couponCode: string
  appliedCoupon: AppliedCoupon | null
  couponError: string
  isPaying: boolean
  showBookingConfirm: boolean

  setCalMonth: (calMonth: number | ((m: number) => number)) => void
  setCalYear: (calYear: number | ((y: number) => number)) => void
  setStartDate: (startDate: Date | null) => void
  setEndDate: (endDate: Date | null) => void
  setPaymentMethod: (paymentMethod: 'online' | 'cash') => void
  setCouponCode: (couponCode: string) => void
  setAppliedCoupon: (appliedCoupon: AppliedCoupon | null) => void
  setCouponError: (couponError: string) => void
  setIsPaying: (isPaying: boolean) => void
  setShowBookingConfirm: (showBookingConfirm: boolean) => void
  resetBooking: () => void
}

const today = new Date()

export const useProductBookingStore = create<ProductBookingState>((set) => ({
  calMonth: today.getMonth(),
  calYear: today.getFullYear(),
  startDate: null,
  endDate: null,
  paymentMethod: 'online',
  couponCode: '',
  appliedCoupon: null,
  couponError: '',
  isPaying: false,
  showBookingConfirm: false,

  setCalMonth: (calMonth) =>
    set((state) => ({
      calMonth:
        typeof calMonth === 'function' ? calMonth(state.calMonth) : calMonth,
    })),
  setCalYear: (calYear) =>
    set((state) => ({
      calYear: typeof calYear === 'function' ? calYear(state.calYear) : calYear,
    })),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setCouponCode: (couponCode) => set({ couponCode }),
  setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
  setCouponError: (couponError) => set({ couponError }),
  setIsPaying: (isPaying) => set({ isPaying }),
  setShowBookingConfirm: (showBookingConfirm) => set({ showBookingConfirm }),

  resetBooking: () =>
    set({
      calMonth: new Date().getMonth(),
      calYear: new Date().getFullYear(),
      startDate: null,
      endDate: null,
      paymentMethod: 'online',
      couponCode: '',
      appliedCoupon: null,
      couponError: '',
      isPaying: false,
      showBookingConfirm: false,
    }),
}))
