import { useMutation } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient.post('/newsletter/subscribe', { email })
      return res.data
    },
  })
}
