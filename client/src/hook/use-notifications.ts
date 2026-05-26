import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from '#/lib/socket-url'
import { authClient } from '#/lib/auth/auth-client'
import { useEffect, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'
import { initNativePush, cleanupNativePush, isNative } from '#/lib/push-notifications'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'

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
  const router = useRouter()
  const pushRegistered = useRef(false)

  // ── 1. Native Push Notifications (Android/iOS via Capacitor) ─────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (pushRegistered.current) return
    pushRegistered.current = true

    if (isNative) {
      // Native: use @capacitor/push-notifications
      initNativePush((url) => {
        // Navigate when user taps a push notification
        router.navigate({ to: url as any }).catch(() => {
          router.navigate({ to: '/notifications' as any })
        })
      })
    } else {
      // Web: use Firebase Web SDK (service worker based)
      registerDeviceForPush()

      // Listen for foreground messages on web
      const unsub = onForegroundMessage((payload) => {
        const notif: Notification = {
          id: payload.data?.id ?? Date.now().toString(),
          title: payload.notification?.title ?? 'New Notification',
          message: payload.notification?.body ?? '',
          type: (payload.data?.type as any) ?? 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData<Notification[] | undefined>(['notifications'], (old) => {
          if (!old) return [notif]
          if (old.some((n) => n.id === notif.id)) return old
          return [notif, ...old]
        })
      })

      return () => {
        unsub?.()
      }
    }

    // Cleanup on logout/unmount
    return () => {
      if (isNative) {
        cleanupNativePush()
        pushRegistered.current = false
      }
    }
  }, [session?.user?.id, queryClient, router])

  // ── 2. Socket.io Real-time Updates (works in foreground for both web & native) ─
  useEffect(() => {
    const token = session?.session?.token
    if (!token) return

    const SOCKET_URL = getSocketUrl()

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
    })

    socket.on('connect', () => {
      console.log('Notifications socket connected', socket.id)
    })

    socket.on('notification', (notif: Notification) => {
      // Update react-query cache when notification arrives via socket
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
