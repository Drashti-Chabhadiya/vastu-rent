import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * /oauth-callback — Mobile Google OAuth landing page
 *
 * After Google auth completes, the Better Auth server redirects the Chrome
 * Custom Tab to THIS page (an HTTPS URL that Chrome can navigate to).
 *
 * This page then immediately JS-redirects to the custom app URL scheme
 * `com.vasturent.app://auth-done`. Chrome Custom Tab cannot follow
 * server-side HTTP redirects to custom schemes, but CAN follow JS navigation.
 *
 * Android intercepts `com.vasturent.app://auth-done`, brings the Capacitor
 * app to the foreground (firing `appUrlOpen`), and the Chrome Custom Tab
 * closes automatically.
 *
 * On web (non-mobile), this page simply redirects to the homepage.
 */
export const Route = createFileRoute('/oauth-callback')({
  component: OAuthCallback,
})

const getSessionTokenUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.')
    ) {
      return 'http://localhost:4000/api/auth/session-token'
    }
  }
  return 'https://new-vastu-rent.onrender.com/api/auth/session-token'
}

function OAuthCallback() {
  useEffect(() => {
    let active = true

    async function handleCallback() {
      let redirectUrl = 'com.vasturent.app://auth-done'
      try {
        const response = await fetch(getSessionTokenUrl(), { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.sessionToken) {
            redirectUrl = `com.vasturent.app://auth-done?token=${encodeURIComponent(data.sessionToken)}`
          }
        }
      } catch (err) {
        console.error('Failed to retrieve session token:', err)
      }

      if (!active) return

      // Redirect to custom scheme — Android intercepts this and fires appUrlOpen
      // in the native app, closing the Chrome Custom Tab automatically.
      window.location.href = redirectUrl

      // Fallback: if we're on web (not intercepted by Android), go to home after 1.2s
      setTimeout(() => {
        if (active) {
          window.location.replace('/')
        }
      }, 1200)
    }

    handleCallback()

    return () => {
      active = false
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8f9fa',
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="32" fill="#1a7a4a" />
        <path
          d="M20 32l9 9 15-15"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
        Login Successful
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
        Returning to the app...
      </p>
    </div>
  )
}
