import { useMutation } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (data: { planName: string; interval: 'yearly' | 'monthly' }) => {
      const res = await apiClient.post('/billing/create-checkout-session', data)
      return res.data
    },
  })
}

export function useVerifyCheckoutSession() {
  return useMutation({
    mutationFn: async (data: { sessionId: string }) => {
      const res = await apiClient.post('/billing/verify-session', data)
      return res.data
    },
  })
}
