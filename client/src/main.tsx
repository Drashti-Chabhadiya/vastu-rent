import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'
import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

// Notify CapGo that the application is loaded and ready
if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady()
}

const router = getRouter()

const rootElement = document.getElementById('app')!

// Register the Service Worker for FCM push notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((reg) => {
        console.log('Firebase Service Worker registered successfully!', reg.scope)
      })
      .catch((err) => {
        console.error('Firebase Service Worker registration failed:', err)
      })
  })
}

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
