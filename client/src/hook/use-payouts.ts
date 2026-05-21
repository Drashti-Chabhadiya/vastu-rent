import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch owner's earnings dashboard analytics
export const usePayoutDashboard = (ownerId?: string) => {
  return useQuery({
    queryKey: ['payout-dashboard', ownerId],
    queryFn: async () => {
      const res = await apiClient.get('/payouts/dashboard', {
        params: ownerId ? { ownerId } : undefined,
      })
      return res.data
    },
  })
}

// Create a new payout / withdrawal request
export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiClient.post('/payouts/request', { amount })
      return res.data.payout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-dashboard'] })
    },
  })
}

// Fetch all payout requests (Admin only)
export const useAllPayoutRequests = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['all-payouts'],
    queryFn: async () => {
      const res = await apiClient.get('/payouts/requests')
      return res.data.payouts
    },
    ...options,
  })
}

// Update status of a payout request (Admin only)
export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string
      status: string
      notes?: string
    }) => {
      const res = await apiClient.patch(`/payouts/${id}/status`, {
        status,
        notes,
      })
      return res.data.payout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['all-payouts'] })
    },
  })
}
