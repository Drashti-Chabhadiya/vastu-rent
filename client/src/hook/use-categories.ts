import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch all categories (Public)
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data.categories
    }
  })
}

// Fetch all categories (Admin)
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/categories')
      return res.data.categories
    }
  })
}

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; icon?: string; color?: string; image?: string }) => {
      await apiClient.post('/admin/categories', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    }
  })
}

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; icon?: string; color?: string; image?: string }) => {
      await apiClient.put(`/admin/categories/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    }
  })
}

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    }
  })
}
