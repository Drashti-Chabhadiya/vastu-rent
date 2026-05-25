import { Outlet, createRootRoute, useRouterState, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Footer, Navbar } from '#/components/layout'
import { Toaster } from '#/components/ui/sonner'
import { useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { getSocketUrl } from '#/lib/socket-url'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootDocument,
})

function NotificationListener() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const token = session?.session?.token
  const userRole = session?.user?.role || 'owner'

  // Register device token for push notifications on login
  useEffect(() => {
    if (token) {
      registerDeviceForPush().catch(() => { })
    }
  }, [token])

  // 1. Global Socket.IO Real-Time Notifications Listener
  useEffect(() => {
    if (!token) return

    const SOCKET_URL = getSocketUrl()
    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
    })

    socket.on('connect', () => {
      console.log('Global authenticated socket connected at root:', socket.id)
    })

    socket.on('notification', (notif: any) => {
      // Update react-query cache instantly
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return [notif]
        if (old.some((n: any) => n.id === notif.id)) return old
        return [notif, ...old]
      })

      // Trigger a beautiful in-app toast alert immediately (like WhatsApp / Instagram)
      toast.info(notif.title, {
        description: notif.message,
        action: {
          label: 'View',
          onClick: () => {
            // Dynamic deep-link navigation
            switch (notif.type) {
              case 'booking':
                if (userRole === 'owner') {
                  navigate({ to: '/account/orders' })
                } else {
                  navigate({ to: '/account/bookings' })
                }
                break
              case 'payment':
                navigate({ to: '/account/payments' })
                break
              case 'info':
                navigate({ to: '/account/messages' })
                break
              default:
                navigate({ to: '/account/notifications' })
                break
            }
          }
        },
        duration: 6000,
      })

      // Trigger native browser desktop notification if supported
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

    return () => {
      socket.disconnect()
    }
  }, [token, queryClient, userRole, navigate])

  // 2. Global Foreground FCM message listener
  useEffect(() => {
    if (!token) return

    const off = onForegroundMessage((payload) => {
      const notif = {
        id: payload?.data?.id || `fb_${Date.now()}`,
        title: payload?.notification?.title || 'Notification',
        message: payload?.notification?.body || payload?.data?.message || '',
        type: payload?.data?.type || 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      // Update react-query notifications cache
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return [notif]
        if (old.some((n: any) => n.id === notif.id)) return old
        return [notif, ...old]
      })

      // Trigger native browser desktop notification immediately like WhatsApp!
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
  }, [queryClient, token])

  return null
}

function RootDocument() {
  const routerState = useRouterState()
  const isAuthPage =
    routerState.location.pathname.startsWith('/login') ||
    routerState.location.pathname.startsWith('/signup')
  const isAdminPage = routerState.location.pathname.startsWith('/admin')
  const isOwnerPage = routerState.location.pathname.startsWith('/owner')

  return (
    <div className={cn('bg-white', 'font-sans', 'antialiased')}>
      <QueryClientProvider client={queryClient}>
        <NotificationListener />
        {!isAuthPage && !isAdminPage && !isOwnerPage && <Navbar />}
        <Outlet />
        {!isAuthPage && !isAdminPage && !isOwnerPage && <Footer />}
      </QueryClientProvider>
      <Toaster position="top-right" />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </div>
  )
}
