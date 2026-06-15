import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

/**
 * Confirm payment for an online rental booking (direct confirmation).
 * Marks the rental as confirmed + paid and returns a transaction reference.
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { rentalId: string }) => {
      const res = await apiClient.post('/payments/confirm-payment', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

/**
 * Create a Stripe/Simulated Checkout Session for booking.
 */
export function useCreateBookingSession() {
  return useMutation({
    mutationFn: async (data: { rentalId: string }) => {
      const res = await apiClient.post('/payments/create-booking-session', data)
      return res.data
    },
  })
}

/**
 * Verify a Stripe/Simulated Checkout Session for booking.
 * Marks the rental as confirmed + paid and invalidates cache queries.
 */
export function useVerifyBookingSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { sessionId: string; rentalId: string }) => {
      const res = await apiClient.post('/payments/verify-booking-session', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
