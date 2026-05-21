import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface Dispute {
  id: string
  rentalId: string
  reportedById: string
  reason: string
  description: string
  status: 'open' | 'resolved' | 'dismissed'
  resolution?: string
  reportedBy?: {
    id: string
    name: string
    email: string
  }
  rental?: {
    id: string
    product: {
      id: string
      title: string
      price: number
    }
    renter: {
      id: string
      name: string
      email: string
    }
  }
  createdAt: string
}

export const useDisputes = () => {
  return useQuery<Dispute[]>({
    queryKey: ['disputes'],
    queryFn: async () => {
      const res = await apiClient.get('/disputes')
      return res.data.disputes
    },
  })
}

export const useCreateDispute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      rentalId: string
      reason: string
      description: string
    }) => {
      const res = await apiClient.post('/disputes', data)
      return res.data.dispute
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
    },
  })
}

export const useResolveDispute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      resolution,
    }: {
      id: string
      status: 'resolved' | 'dismissed'
      resolution?: string
    }) => {
      const res = await apiClient.put(`/disputes/${id}/resolve`, {
        status,
        resolution,
      })
      return res.data.dispute
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
    },
  })
}
