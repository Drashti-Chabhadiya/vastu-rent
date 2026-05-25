import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { apiClient } from '#/lib/api'

let messaging: ReturnType<typeof getMessaging> | null = null

export function initFirebase() {
  if (typeof window === 'undefined') return
  if ((window as any).__fcm_initialized) return

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  try {
    const app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
      ; (window as any).__fcm_initialized = true
  } catch (err) {
    console.error('Firebase init error', err)
  }
}

export async function registerDeviceForPush() {
  initFirebase()
  if (!messaging) return

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    
    let serviceWorkerRegistration;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker explicitly
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      
      // Wait for the service worker to become fully active/activated
      if (!registration.active) {
        await new Promise<void>((resolve) => {
          const sw = registration.installing || registration.waiting
          if (sw) {
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') resolve()
            })
          } else {
            resolve()
          }
          // Max wait of 2.5 seconds to prevent blocking indefinitely
          setTimeout(resolve, 2500)
        })
      }
      
      serviceWorkerRegistration = registration
    }

    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration
    })
    if (!token) return

    // Register token with server
    await apiClient.post('/notifications/device/register', { token, platform: 'web' })
    return token
  } catch (err) {
    console.error('Failed to register for push', err)
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  if (!messaging) return () => { }
  return onMessage(messaging, (payload) => {
    cb(payload)
  })
}
