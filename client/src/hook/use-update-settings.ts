import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const res = await apiClient.patch('/users/settings', settings)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}
