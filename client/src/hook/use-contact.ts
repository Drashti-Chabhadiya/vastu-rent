import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useAdminContacts() {
  return useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/contacts')
      return res.data.inquiries
    },
  })
}

export function useMarkContactRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const res = await apiClient.patch(`/admin/contacts/${id}/read`, {
        isRead,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/contacts/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
    },
  })
}
