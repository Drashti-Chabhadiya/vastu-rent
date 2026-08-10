import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { useSessionContext } from '#/context/SessionContext'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'booking' | 'payment' | 'alert'
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  const { data: session } = useSessionContext()
  const isAuthenticated = Boolean(session?.user?.id || session?.session?.token)

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications')
      return res.data.notifications
    },
    enabled: isAuthenticated,
    retry: false,
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
