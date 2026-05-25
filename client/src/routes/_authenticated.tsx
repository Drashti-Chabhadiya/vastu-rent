import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'
import { useEffect } from 'react'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'
import { useQueryClient } from '@tanstack/react-query'

function AuthenticatedLayout() {
  const queryClient = useQueryClient()

  // Register device token for push notifications on login
  useEffect(() => {
    registerDeviceForPush().catch(() => {})
  }, [])

  // Global Foreground message listener
  useEffect(() => {
    const off = onForegroundMessage((payload) => {
      const notif = {
        id: payload?.data?.id || `fb_${Date.now()}`,
        title: payload?.notification?.title || 'Notification',
        message: payload?.notification?.body || payload?.data?.message || '',
        type: payload?.data?.type || 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      // 1. Update react-query notifications cache
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return [notif]
        if (old.some((n: any) => n.id === notif.id)) return old
        return [notif, ...old]
      })

      // 2. Trigger native browser desktop notification immediately like WhatsApp!
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/images/icons/icon-192.png',
          })
        } catch (err) {
          console.error('Failed to trigger native notification:', err)
        }
      }
    })
    return () => off && off()
  }, [queryClient])

  return <Outlet />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const sessionRes = await authClient.getSession()
    const session = sessionRes.data

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    return {
      session,
    }
  },
  component: AuthenticatedLayout,
})
