import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface CategoryRequest {
  id: string
  name: string
  icon?: string
  color?: string
  image?: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  ownerId: string
  owner?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

export const useCategoryRequests = () => {
  return useQuery<CategoryRequest[]>({
    queryKey: ['category-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/category-requests')
      return res.data.requests
    }
  })
}

export const useCreateCategoryRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; icon?: string; color?: string; image?: string; description?: string; requestReason?: string }) => {
      const res = await apiClient.post('/category-requests', data)
      return res.data.categoryRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-requests'] })
    }
  })
}

export const useUpdateCategoryRequestStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'approved' | 'rejected'; reason?: string }) => {
      const res = await apiClient.put(`/category-requests/${id}/status`, { status, reason })
      return res.data.request
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}
