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
    enabled: !!productId,
  })
}

// Create a review for a product (authenticated)
export const useCreateReview = (productId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      rating: number
      comment: string
      productId?: string
    }) => {
      const targetProductId = data.productId || productId
      if (!targetProductId)
        throw new Error('Product ID is required to create a review')
      const res = await apiClient.post('/reviews', {
        rating: data.rating,
        comment: data.comment,
        productId: targetProductId,
      })
      return res.data.review
    },
    onSuccess: (_, variables) => {
      const targetProductId = variables.productId || productId
      if (targetProductId) {
        queryClient.invalidateQueries({
          queryKey: ['product-reviews', targetProductId],
        })
        queryClient.invalidateQueries({
          queryKey: ['product', targetProductId],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
    },
  })
}

// Reply to a review (lister)
export const useReplyToReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      reviewId,
      replyText,
    }: {
      reviewId: string
      replyText: string
    }) => {
      const res = await apiClient.post(`/reviews/${reviewId}/reply`, {
        replyText,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })
}

// Fetch all reviews with filters (admin)
export const useAdminReviews = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/reviews', { params })
      return res.data.reviews
    },
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
    },
  })
}
