import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  maxDiscount?: number
  minBooking?: number
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit?: number | null
  usedCount: number
  perUserLimit?: number | null
  ownerId?: string | null
  productId?: string | null
  product?: { title: string } | null
  createdAt: string
}

export const useCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await apiClient.get('/coupons')
      return res.data.coupons
    },
  })
}

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const res = await apiClient.post('/coupons', data)
      return res.data.coupon
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/coupons/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

export const useApproveCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/coupons/${id}/approve`)
      return res.data.coupon
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({
      code,
      totalPrice,
      productId,
    }: {
      code: string
      totalPrice: number
      productId?: string
    }) => {
      const res = await apiClient.post('/coupons/apply', {
        code,
        totalPrice,
        productId,
      })
      return res.data.coupon
    },
  })
}
