import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings')
      return res.data?.settings || {}
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiClient.post('/settings/update', { settings })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
