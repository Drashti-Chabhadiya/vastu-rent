import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface DeleteRequest {
  id: string
  productId: string
  adminId: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  product?: {
    id: string
    title: string
  }
  admin?: {
    id: string
    name: string
    email: string
  }
}

export const useDeleteRequests = () => {
  return useQuery<DeleteRequest[]>({
    queryKey: ['delete-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/delete-requests')
      return res.data.requests
    },
  })
}

export const useProcessDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'approved' | 'rejected'
    }) => {
      const res = await apiClient.patch(`/delete-requests/${id}/process`, {
        status,
      })
      return res.data.deleteRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delete-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['recent-products'] })
    },
  })
}

export const useCreateDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { productId: string; reason?: string }) => {
      const res = await apiClient.post('/delete-requests', data)
      return res.data.deleteRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delete-requests'] })
    },
  })
}
