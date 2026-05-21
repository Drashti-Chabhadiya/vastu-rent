import { useQuery } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch admin stats
export const useAdminStats = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats')
      return res.data.stats
    },
    ...options,
  })
}

// Fetch bookings over time
export const useBookingsOverTime = (
  period: 'week' | 'month' | 'year' = 'week',
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['bookings-over-time', period],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats/bookings-over-time', {
        params: { period },
      })
      return res.data.data as { date: string; bookings: number }[]
    },
    ...options,
  })
}

// Fetch revenue over time
export const useRevenueOverTime = (
  period: 'week' | 'month' | 'year' = 'month',
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['revenue-over-time', period],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats/revenue-over-time', {
        params: { period },
      })
      return res.data as { data: { date: string; revenue: number }[]; totalRevenue: number }
    },
    ...options,
  })
}

// Fetch top cities by listings
export const useTopCities = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['top-cities'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats/top-cities')
      return res.data.cities as { name: string; count: string; percentage: number }[]
    },
    ...options,
  })
}

// Fetch recent reviews for admin dashboard
export const useAdminRecentReviews = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-recent-reviews'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats/recent-reviews')
      return res.data.reviews
    },
    ...options,
  })
}
