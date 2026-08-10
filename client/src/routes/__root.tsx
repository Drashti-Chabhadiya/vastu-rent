import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Footer, Navbar, Tabbar } from '#/components/layout'
import { Toaster } from '#/components/ui/sonner'
import { useEffect } from 'react'
import { SessionProvider, useSessionContext } from '#/context/SessionContext'
import { queryClient } from '#/lib/query-client'
import { registerDeviceForPush, onForegroundMessage } from '#/lib/fcm'
import { isNative, initNativePush } from '#/lib/push-notifications'
import { toast } from 'sonner'
import { supabase } from '#/lib/supabase'
import { Capacitor } from '@capacitor/core'
import { authApi } from '#/features/auth/api/auth'
import { App as CapacitorApp } from '@capacitor/app'
import { TranslationProvider } from '#/context/TranslationContext'
import { cn } from '#/lib/utils'

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
  const userId = session?.user?.id

  useAppResumeRefresh()

  // Register device token for push notifications (works for both logged in and guest users)
  useEffect(() => {
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

  // 1. Global Supabase Realtime Notifications & Products Listener
  useEffect(() => {
    const globalChannel = supabase
      .channel('global-broadcasts')
      .on('broadcast', { event: 'product_added' }, () => {
        rqClient.invalidateQueries({ queryKey: ['products'] })
        rqClient.invalidateQueries({ queryKey: ['recent-products'] })
        rqClient.invalidateQueries({ queryKey: ['admin-products'] })
      })
      .on('broadcast', { event: 'product_updated' }, () => {
        rqClient.invalidateQueries({ queryKey: ['products'] })
        rqClient.invalidateQueries({ queryKey: ['recent-products'] })
        rqClient.invalidateQueries({ queryKey: ['admin-products'] })
      })
      .on('broadcast', { event: 'product_deleted' }, () => {
        rqClient.invalidateQueries({ queryKey: ['products'] })
        rqClient.invalidateQueries({ queryKey: ['recent-products'] })
        rqClient.invalidateQueries({ queryKey: ['admin-products'] })
      })
      .subscribe()

    let userChannel: any = null
    if (userId) {
      userChannel = supabase
        .channel(`user_notifications_${userId}`)
        .on(
          'broadcast',
          { event: 'notification' },
          ({ payload: notif }: { payload: any }) => {
            if (!notif) return
            rqClient.setQueryData(['notifications'], (old: any) => {
              if (!old) return [notif]
              if (old.some((n: any) => n.id === notif.id)) return old
              return [notif, ...old]
            })

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
                  .catch((err: any) => {
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
                      console.error(
                        'Fallback notification also failed:',
                        fallbackErr,
                      )
                    }
                  })
              }
            }

            toast(notif.title, {
              description: notif.message,
              action: notif.url
                ? {
                    label: 'View',
                    onClick: () => navigate({ to: notif.url }),
                  }
                : undefined,
            })
          },
        )
        .subscribe()
    }

    return () => {
      globalChannel.unsubscribe()
      if (userChannel) userChannel.unsubscribe()
    }
  }, [userId, rqClient, navigate])

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
  const navigate = useNavigate()

  useEffect(() => {
    const checkVerification = async () => {
      const currentPath = routerState.location.pathname
      const isAuthRoute =
        currentPath.startsWith('/login') || currentPath.startsWith('/signup')

      if (isAuthRoute) {
        const pendingData = await authApi.getPendingVerification()
        if (pendingData?.pending) {
          navigate({
            to: '/verify-email',
            search: { email: pendingData.email },
          })
        }
      }
    }

    // Check on route changes or component mount
    checkVerification()

    // Listen for Capacitor app resume (native)
    let capHandle: { remove: () => void } | null = null
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) checkVerification()
      }).then((handle) => {
        capHandle = handle
      })
    }

    // Listen for web browser visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVerification()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      capHandle?.remove()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [routerState.location.pathname, navigate])
  const isAuthPage =
    routerState.location.pathname.startsWith('/login') ||
    routerState.location.pathname.startsWith('/signup')
  const isAdminPage = routerState.location.pathname.startsWith('/admin')
  const isDashboardPage = routerState.location.pathname.startsWith('/dashboard')
  const isChatPage =
    routerState.location.pathname.startsWith('/account/messages')

  const isProductDetailPage =
    routerState.location.pathname.startsWith('/products/')

  return (
    <div
      className={cn(
        'bg-background',
        'font-sans',
        'antialiased',
        'h-dvh',
        'overflow-hidden',
        'flex flex-col',
        'w-full',
      )}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <TranslationProvider>
            <NotificationListener />

            {/* Desktop Navigation Header */}
            {!isAuthPage && !isAdminPage && !isDashboardPage && (
              <div
                className={cn(
                  'sticky top-0 z-40 shrink-0',
                  'hidden md:block',
                  isChatPage && 'hidden lg:block',
                )}
              >
                <Navbar />
              </div>
            )}

            {/* Main Scrollable Viewport Container */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
              <div
                className={cn(
                  'min-h-full flex flex-col justify-between',
                  !isAuthPage &&
                    !isChatPage &&
                    !isProductDetailPage &&
                    'pb-[80px] md:pb-0',
                )}
              >
                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                  <Outlet />
                </div>

                {/* Footer - Desktop Only */}
                {!isAuthPage && !isAdminPage && !isDashboardPage && (
                  <div
                    className={cn(
                      'hidden md:block shrink-0',
                      isChatPage && 'hidden',
                    )}
                  >
                    <Footer />
                  </div>
                )}
              </div>
            </main>

            {/* Mobile Navigation Tabbar */}
            {!isAuthPage && !isChatPage && !isProductDetailPage && <Tabbar />}
          </TranslationProvider>
        </SessionProvider>
      </QueryClientProvider>
      <Toaster position="top-right" />
      {/* <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
      /> */}
    </div>
  )
}
