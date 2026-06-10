/* eslint-disable no-restricted-globals */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications for the WEB version of the app.
 * Native Android/iOS notifications are handled by @capacitor/push-notifications.
 */
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
)
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js',
)

// ─── Firebase Config ──────────────────────────────────────────────────────────
// ⚠️  Do NOT hardcode values here.
// These %PLACEHOLDERS% are replaced at build time by the Vite plugin in vite.config.ts
// using VITE_FIREBASE_* variables from the .env file.
const firebaseConfig = {
  apiKey: '%VITE_FIREBASE_API_KEY%',
  authDomain: '%VITE_FIREBASE_AUTH_DOMAIN%',
  projectId: '%VITE_FIREBASE_PROJECT_ID%',
  storageBucket: '%VITE_FIREBASE_STORAGE_BUCKET%',
  messagingSenderId: '%VITE_FIREBASE_MESSAGING_SENDER_ID%',
  appId: '%VITE_FIREBASE_APP_ID%',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// ─── Background Message Handler ───────────────────────────────────────────────
// Triggered when the app is in the background or closed (web only)
messaging.onBackgroundMessage(function (payload) {
  console.log('[SW] Background message received:', payload)

  const notificationTitle = payload.notification?.title || 'New Notification'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || '',
    data: {
      ...payload.data,
      // Ensure click_action URL is available
      url: payload.data?.url || payload.fcmOptions?.link || '/',
    },
    icon: '/logo192.png',
    badge: '/logo192.png',
    image: payload.notification?.image || payload.data?.image || '',
    vibrate: [200, 100, 200],
    tag: payload.data?.id || 'vastu-rent-notification', // prevents duplicates
    requireInteraction: false,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const data = event.notification.data || {}
  const urlToOpen = data.url || data.click_action || '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Focus an existing window if one exists at the target URL
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            // Navigate the existing window to the target URL
            if ('navigate' in client) {
              return client.navigate(urlToOpen)
            }
            return
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
