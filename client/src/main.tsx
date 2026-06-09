import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'
import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

// Google Translate React compatibility patch.
// Google Translate wraps text nodes in <font> elements, which can cause React's
// virtual DOM to lose track of nodes. This patch silently handles the mismatch
// so React never crashes with "removeChild: The node is not a child of this node".
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    // If Google Translate moved the child to a different parent, operate on the real parent
    if (child.parentNode && child.parentNode !== this) {
      return originalRemoveChild.call(child.parentNode, child) as T
    }
    // If the node is fully detached, swallow gracefully so React doesn't crash
    try {
      return originalRemoveChild.call(this, child) as T
    } catch (_e) {
      return child
    }
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    // If Google Translate moved the reference node to a different parent, follow it
    if (referenceNode && referenceNode.parentNode && referenceNode.parentNode !== this) {
      return originalInsertBefore.call(referenceNode.parentNode, newNode, referenceNode) as T
    }
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T
    } catch (_e) {
      return newNode
    }
  }
}

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
        console.log(
          'Firebase Service Worker registered successfully!',
          reg.scope,
        )
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
