import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Footer, Navbar } from '#/components/layout'
import { Toaster } from '#/components/ui/sonner'
import { useEffect, useRef } from 'react'
import { SessionProvider, useSessionContext } from '#/context/SessionContext'
import { queryClient } from '#/lib/query-client'
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
  const { data: session } = useSessionContext()
  const token = session?.session.token
  const userRole = session?.user.role || 'user'
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
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'denied') {
          toast.warning('Notifications Blocked', {
            description:
              'Please enable notifications in your browser address bar settings to receive real-time updates.',
            duration: 8000,
          })
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              registerDeviceForPush().catch(() => {})
            }
          })
        } else if (Notification.permission === 'granted') {
          registerDeviceForPush().catch(() => {})
        }
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

      if (!isNative) {
        if (
          typeof window !== 'undefined' &&
          'serviceWorker' in navigator &&
          Notification.permission === 'granted'
        ) {
          navigator.serviceWorker.ready
            .then((reg) => {
              reg.showNotification(notif.title, {
                body: notif.message,
                icon: '/logo192.png',
                badge: '/logo192.png',
                image: notif.image,
                data: {
                  url: notif.url || '/account/notifications',
                },
              } as any)
            })
            .catch((err) => {
              console.error(
                'Failed to trigger native notification via service worker:',
                err,
              )
              // Fallback to main thread Notification
              try {
                const notification = new Notification(notif.title, {
                  body: notif.message,
                  icon: '/logo192.png',
                  image: notif.image,
                } as any)
                notification.onclick = (e) => {
                  e.preventDefault()
                  window.focus()
                  navigate({ to: notif.url || '/account/notifications' })
                }
              } catch (fallbackErr) {
                console.error('Fallback notification also failed:', fallbackErr)
              }
            })
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
        url: payload?.data?.url || payload?.fcmOptions?.link || '',
        image: payload?.notification?.image || payload?.data?.image || '',
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
        'serviceWorker' in navigator &&
        Notification.permission === 'granted'
      ) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification(notif.title, {
              body: notif.message,
              icon: '/logo192.png',
              badge: '/logo192.png',
              image: notif.image,
              data: {
                url: notif.url || '/account/notifications',
              },
            } as any)
          })
          .catch((err) => {
            console.error(
              'Failed to trigger native notification via service worker:',
              err,
            )
            try {
              const notification = new Notification(notif.title, {
                body: notif.message,
                icon: '/logo192.png',
                image: notif.image,
              } as any)
              notification.onclick = (e) => {
                e.preventDefault()
                window.focus()
                navigate({ to: notif.url || '/account/notifications' })
              }
            } catch (fallbackErr) {
              console.error('Fallback notification also failed:', fallbackErr)
            }
          })
      }
    })
    return () => off && off()
  }, [rqClient, token, navigate])

  return null
}

function RootDocument() {
  const routerState = useRouterState()
  const isAuthPage =
    routerState.location.pathname.startsWith('/login') ||
    routerState.location.pathname.startsWith('/signup')
  const isAdminPage = routerState.location.pathname.startsWith('/admin')
  const isDashboardPage = routerState.location.pathname.startsWith('/dashboard')
  const isChatPage =
    routerState.location.pathname.startsWith('/account/messages')

  return (
    <div
      className={cn(
        'bg-card',
        'font-sans',
        'antialiased',
        'min-h-screen',
        'w-full',
      )}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
        <TranslationProvider>
          <NotificationListener />
          {!isAuthPage && !isAdminPage && !isDashboardPage && (
            <div
              className={cn(
                'sticky top-0 z-40',
                isChatPage && 'hidden lg:block',
              )}
            >
              <Navbar />
            </div>
          )}
          <Outlet />
          {!isAuthPage && !isAdminPage && !isDashboardPage && (
            <div className={cn(isChatPage && 'hidden')}>
              <Footer />
            </div>
          )}
        </TranslationProvider>
        </SessionProvider>
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
