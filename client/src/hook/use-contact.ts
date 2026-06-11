import { useMutation } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      subject: string
      message: string
    }) => {
      const res = await apiClient.post('/contact', data)
      return res.data
    },
  })
}
