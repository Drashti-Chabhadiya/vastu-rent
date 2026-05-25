/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker by passing in
// the messagingSenderId.
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || '%FIREBASE_API_KEY%',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '%FIREBASE_AUTH_DOMAIN%',
  projectId: self.FIREBASE_PROJECT_ID || '%FIREBASE_PROJECT_ID%',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '%FIREBASE_STORAGE_BUCKET%',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '%FIREBASE_MESSAGING_SENDER_ID%',
  appId: self.FIREBASE_APP_ID || '%FIREBASE_APP_ID%',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || 'New Notification'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || '',
    data: payload.data || {},
    icon: '/images/icons/icon-192.png',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const clickAction = event.notification?.data?.click_action || '/'
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      if (client.url === clickAction && 'focus' in client) return client.focus()
    }
    if (clients.openWindow) return clients.openWindow(clickAction)
  }))
})
