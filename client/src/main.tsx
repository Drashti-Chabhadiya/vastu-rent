import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'
import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { initSecureToken } from '#/lib/auth/token-storage'
import { App } from '@capacitor/app'

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
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    // If Google Translate moved the reference node to a different parent, follow it
    if (
      referenceNode &&
      referenceNode.parentNode &&
      referenceNode.parentNode !== this
    ) {
      return originalInsertBefore.call(
        referenceNode.parentNode,
        newNode,
        referenceNode,
      ) as T
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

const EXPECTED_PACKAGE_NAME = import.meta.env.VITE_EXPECTED_PACKAGE_NAME || ''

const verifyAppIntegrity = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return true
  try {
    const info = await App.getInfo()
    if (info.id !== EXPECTED_PACKAGE_NAME) {
      console.error(
        `[SECURITY VIOLATION] Unofficial app package ID detected: ${info.id}`,
      )
      return false
    }
    return true
  } catch (err) {
    console.error('Failed to verify app integrity:', err)
    return true
  }
}

// Wait for secure token storage to be initialized before rendering the app
initSecureToken().then(async () => {
  const isGenuine = await verifyAppIntegrity()

  if (!isGenuine) {
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0f172a; color: #ef4444; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 24px; box-sizing: border-box;">
          <div style="font-size: 56px; margin-bottom: 16px;">⚠️</div>
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0; color: #f87171;">Security Violation</h1>
          <p style="font-size: 14px; color: #94a3b8; max-width: 320px; margin: 0; line-height: 1.5;">
            This version of the application has been tampered with or is an unofficial clone. Please download the official <b>Vastu Rent</b> app from the Google Play Store.
          </p>
        </div>
      `
    }
    return
  }

  if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    )
  }
})
