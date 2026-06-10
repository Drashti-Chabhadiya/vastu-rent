import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Footer, Navbar } from '#/components/layout'
import { Toaster } from '#/components/ui/sonner'
import { useEffect, useRef } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { isAdminRole, isUserRole } from '#/lib/auth/roles'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'
import { isNative, initNativePush } from '#/lib/push-notifications'
// import { playNotificationSound } from '#/lib/sound'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { getSocketUrl } from '#/lib/socket-url'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'

import { TranslationProvider } from '#/context/TranslationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep cached data fresh for 30 seconds before considering it stale.
      // This prevents unnecessary refetches when switching tabs / screens.
      staleTime: 30_000,

      // Retry failed requests up to 2 times with React Query's built-in
      // exponential back-off before showing an error to the user.
      retry: 2,

      // 'offlineFirst' tells React Query to attempt queries regardless of
      // what it thinks the network state is. In Capacitor WebViews the
      // navigator.onLine / online event is unreliable, so without this flag
      // queries can get stuck in a "paused" state and never fire.
      networkMode: 'offlineFirst',

      // Always re-fetch when the window/app regains focus so data is
      // never stale after the user backgrounds and returns to the app.
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Also run mutations without checking perceived network state.
      networkMode: 'offlineFirst',
    },
  },
})

export const Route = createRootRoute({
  component: RootDocument,
})

// ─── App-resume / focus refresh ────────────────────────────────────────────
// Wires BOTH the DOM visibilitychange event (web) and the Capacitor
// appStateChange event (Android / iOS) to invalidate stale queries.
// visibilitychange fires unreliably inside the Capacitor WebView on Android,
// so the Capacitor listener is the reliable fallback for native.
function useAppResumeRefresh() {
  const rqClient = useQueryClient()

  useEffect(() => {
    const refresh = () => {
      // Invalidate all queries that are currently considered stale so they
      // re-fetch silently in the background when the app comes back.
      rqClient.invalidateQueries()
    }

    // Web / browser visibility handler
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Capacitor native app-state handler
    let capHandle: { remove: () => void } | null = null
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) refresh()
      }).then((handle) => {
        capHandle = handle
      })
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      capHandle?.remove()
    }
  }, [rqClient])
}

// ─── Notification + real-time listener ─────────────────────────────────────
function NotificationListener() {
  const rqClient = useQueryClient()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const token = session?.session.token
  const userRole = session?.user.role || 'user'
  const isAdmin = isAdminRole(userRole)
  const socketRef = useRef<Socket | null>(null)

  useAppResumeRefresh()

  // Register device token for push notifications on login
  useEffect(() => {
    if (!token) return

    if (isNative) {
      initNativePush((url) => {
        navigate({ to: url as any }).catch(() => {
          navigate({ to: '/account/notifications' as any })
        })
      })
    } else {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        registerDeviceForPush().catch(() => {})
      }
    }
  }, [token, navigate])

  // 1. Global Socket.IO Real-Time Notifications Listener
  useEffect(() => {
    if (!token) return

    const SOCKET_URL = getSocketUrl()
    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
      // Robust reconnection so the socket recovers after phone sleep / network
      // changes without requiring the user to restart the app.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      randomizationFactor: 0.5,
      timeout: 20_000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Global authenticated socket connected at root:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.warn('Global notification socket disconnected:', reason)
      // Socket.IO auto-reconnects unless disconnect() was called manually.
    })

    socket.on('connect_error', (err) => {
      console.error('Global notification socket error:', err.message)
    })

    socket.on('notification', (notif: any) => {
      // Update react-query cache instantly
      rqClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return [notif]
        if (old.some((n: any) => n.id === notif.id)) return old
        return [notif, ...old]
      })

      // Play alert chime
      // playNotificationSound()

      // Trigger a beautiful in-app toast alert immediately (only on web, not inside the native mobile app)
      if (!isNative) {
        toast.info(notif.title, {
          description: notif.message,
          action: {
            label: 'View',
            onClick: () => {
              // Dynamic deep-link navigation
              switch (notif.type) {
                case 'booking':
                  if (isUserRole(userRole)) {
                    navigate({ to: '/account/orders' })
                  } else if (isAdmin) {
                    navigate({ to: '/account/bookings' })
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
            },
          },
          duration: 6000,
        })
      }

      // Trigger native browser desktop notification if supported
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
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
      socketRef.current = null
    }
  }, [token, rqClient, userRole, navigate])

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
      rqClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return [notif]
        if (old.some((n: any) => n.id === notif.id)) return old
        return [notif, ...old]
      })

      // Play alert chime
      // playNotificationSound()

      // Trigger native browser desktop notification immediately like WhatsApp!
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
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
  }, [rqClient, token])

  return null
}

function RootDocument() {
  const routerState = useRouterState()
  const isAuthPage =
    routerState.location.pathname.startsWith('/login') ||
    routerState.location.pathname.startsWith('/signup')
  const isAdminPage = routerState.location.pathname.startsWith('/admin')
  const isDashboardPage = routerState.location.pathname.startsWith('/dashboard')

  return (
    <div className={cn('bg-card', 'font-sans', 'antialiased')}>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <NotificationListener />
          {!isAuthPage && !isAdminPage && !isDashboardPage && <Navbar />}
          <Outlet />
          {!isAuthPage && !isAdminPage && !isDashboardPage && <Footer />}
        </TranslationProvider>
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
