import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface CategoryDeleteRequest {
  id: string
  categoryId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
    image?: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export const useCategoryDeleteRequests = () => {
  return useQuery<CategoryDeleteRequest[]>({
    queryKey: ['category-delete-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/category-delete-requests')
      return res.data.requests
    },
  })
}

export const useCreateCategoryDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { categoryId: string; reason?: string }) => {
      const res = await apiClient.post('/category-delete-requests', data)
      return res.data.deleteRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-delete-requests'] })
    },
  })
}

export const useProcessCategoryDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'approved' | 'rejected'
    }) => {
      const res = await apiClient.patch(
        `/category-delete-requests/${id}/process`,
        {
          status,
        },
      )
      return res.data.deleteRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-delete-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
