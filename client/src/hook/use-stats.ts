import { useQuery } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch admin stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats')
      return res.data.stats
    }
  })
}
