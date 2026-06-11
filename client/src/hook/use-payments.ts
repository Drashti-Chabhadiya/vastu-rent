import { useMutation } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: { rentalId: string }) => {
      const res = await apiClient.post('/payments/create-order', data)
      return res.data
    },
  })
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: async (data: {
      razorpay_payment_id: string
      razorpay_order_id: string
      razorpay_signature: string
      rentalId: string
    }) => {
      const res = await apiClient.post('/payments/verify-payment', data)
      return res.data
    },
  })
}
