import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { io, Socket } from 'socket.io-client'
import { authClient } from '#/lib/auth/auth-client'
import { useEffect } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'booking' | 'payment' | 'alert'
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  // Socket real-time subscription
  // Note: we prefer to reuse existing socket connection in the app; this hook creates its own lightweight connection scoped to notifications.
  useEffect(() => {
    const token = session?.session?.token
    if (!token) return

    const SOCKET_URL =
      import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000')

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
    })

    socket.on('connect', () => {
      console.log('Notifications socket connected', socket.id)
    })

    socket.on('notification', (notif: Notification) => {
      // Update react-query cache
      queryClient.setQueryData<Notification[] | undefined>(['notifications'], (old) => {
        if (!old) return [notif]
        if (old.some((n) => n.id === notif.id)) return old
        return [notif, ...old]
      })
    })

    socket.on('connect_error', (err) => console.error('Notif socket error', err))

    return () => {
      socket.disconnect()
    }
  }, [session?.session?.token, queryClient])

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications')
      return res.data.notifications
    },
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
