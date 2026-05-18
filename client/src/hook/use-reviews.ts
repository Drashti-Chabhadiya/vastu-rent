import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch reviews for a specific product (public)
export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const res = await apiClient.get('/reviews', { params: { productId } })
      return res.data.reviews as {
        id: string
        rating: number
        comment?: string
        createdAt: string
        user: { name: string; image?: string }
      }[]
    },
    enabled: !!productId
  })
}

// Create a review for a product (authenticated)
export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const res = await apiClient.post('/reviews', { ...data, productId })
      return res.data.review
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
    }
  })
}

// Fetch all reviews with filters (admin)
export const useAdminReviews = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/reviews', { params })
      return res.data.reviews
    }
  })
}

// Delete review mutation (admin)
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/reviews/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })
}
