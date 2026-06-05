import { Button } from '@/components/ui/button'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect, useRef } from 'react'
import { Loader } from '@/components/ui/loader'
import { toast } from 'sonner'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

/**
 * The backend base URL that the native Capacitor app talks to directly.
 * Must match the fallback in auth-client.ts so all cookies share one domain.
 */
const NATIVE_AUTH_BASE =
  import.meta.env.VITE_AUTH_URL?.replace('/api/auth', '') ||
  'https://new-vastu-rent.onrender.com'

/**
 * After Google OAuth completes, Better Auth redirects the Chrome Custom Tab to
 * this page on the same origin as the server so the session cookie is set on
 * the correct domain before the app regains focus.
 *
 * For the native app the callbackURL must be on the SAME domain as the auth
 * server (Render) so that Better Auth can set the session cookie on that domain
 * and the Capacitor WebView (which also talks to Render) can pick it up.
 */
const NATIVE_CALLBACK_URL = `${NATIVE_AUTH_BASE}/oauth-callback`

/**
 * Waits for Better Auth's session to become available, retrying a few times
 * after the Chrome Custom Tab closes (cookies may take a moment to sync).
 */
async function waitForSession(retries = 5, delayMs = 600): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const { data } = await authClient.getSession()
    if (data?.session) return true
    if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs))
  }
  return false
}

export function SocialAuth() {
  const [isLoading, setIsLoading] = useState<string | null>(null) // 'google' | null
  // Ref to the browserFinished listener so we can remove it from appUrlOpen too
  const browserFinishedRef = useRef<{ remove: () => void } | null>(null)

  // PRIMARY: appUrlOpen fires when the /oauth-callback page on Render redirects
  // the Chrome Custom Tab to com.vasturent.app://auth-done via JS.
  // Android intercepts the custom scheme, brings the app to front, and fires this event.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = App.addListener('appUrlOpen', async (data) => {
      if (!data.url?.startsWith('com.vasturent.app://')) return

      // Clean up the browserFinished fallback — appUrlOpen took over
      browserFinishedRef.current?.remove()
      browserFinishedRef.current = null

      // Close the Chrome Custom Tab
      await Browser.close().catch(console.error)

      // Explicitly refetch the session from Render.
      // The session cookie was set on new-vastu-rent.onrender.com by Better Auth;
      // the WebView shares that cookie store for HTTPS origins on Android.
      const ok = await waitForSession()
      if (ok) {
        // Navigate to home — replace so the user can't "back" to the login screen
        window.location.replace('/')
      } else {
        // Session not found — possibly the user cancelled or an error occurred
        toast.error('Sign-in failed. Please try again.')
        setIsLoading(null)
      }
    })

    return () => {
      listenerPromise.then((l) => l.remove()).catch(console.error)
    }
  }, [])

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider !== 'google') {
      toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not implemented yet.`)
      return
    }

    setIsLoading('google')
    try {
      if (Capacitor.isNativePlatform()) {
        // FALLBACK: fires when the user closes the Custom Tab manually without
        // the JS-redirect triggering the custom scheme (e.g. user pressed back).
        browserFinishedRef.current?.remove()
        browserFinishedRef.current = await Browser.addListener('browserFinished', async () => {
          browserFinishedRef.current?.remove()
          browserFinishedRef.current = null

          // Try to pick up any session that was established before the tab closed
          const ok = await waitForSession()
          if (ok) {
            window.location.replace('/')
          } else {
            setIsLoading(null)
          }
        })

        // Ask Better Auth for the Google OAuth URL.
        // callbackURL is on the SAME domain as the auth server so the session
        // cookie is set there and can be read by the WebView.
        const result = await authClient.signIn.social({
          provider: 'google',
          callbackURL: NATIVE_CALLBACK_URL,
          disableRedirect: true,
        })

        if (result?.data?.url) {
          // Open Google login inside a secure native Chrome Custom Tab
          await Browser.open({ url: result.data.url })
        } else if (result?.error) {
          browserFinishedRef.current?.remove()
          browserFinishedRef.current = null
          console.error('Google Sign-In failed:', result.error)
          toast.error(result.error.message || 'Failed to initialize Google sign-in.')
          setIsLoading(null)
        }
      } else {
        // Web browser: let Better Auth handle the full redirect flow
        const result = await authClient.signIn.social({
          provider: 'google',
          callbackURL: window.location.origin,
        })

        // better-auth redirects the browser window on success.
        // Only show an error if it fails before redirecting.
        if (result?.error) {
          console.error('Google Sign-In failed:', result.error)
          toast.error(result.error.message || 'Failed to initialize Google sign-in.')
          setIsLoading(null)
        }
      }
    } catch (err: any) {
      console.error('Unexpected Google Sign-In error:', err)
      toast.error('An unexpected error occurred. Please try again.')
      setIsLoading(null)
    }
  }


  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={isLoading !== null}
        onClick={() => handleSocialSignIn('google')}
      >
        {isLoading === 'google' ? (
          <Loader size={18} variant="brand" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span className="text-[13px] hidden sm:inline">
          {isLoading === 'google' ? 'Signing in...' : 'Google'}
        </span>
      </Button>

      {/* Facebook */}
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={isLoading !== null}
        onClick={() => handleSocialSignIn('facebook')}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            fill="#1877F2"
          />
        </svg>
        <span className="text-[13px] hidden sm:inline">Facebook</span>
      </Button>

      {/* Apple */}
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={isLoading !== null}
        onClick={() => handleSocialSignIn('apple')}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.636 12.193c-.015-2.794 2.278-4.12 2.383-4.185-1.302-1.905-3.327-2.164-4.048-2.197-1.722-.174-3.364 1.013-4.248 1.013-.883 0-2.247-1.002-3.66-1.002-1.848.016-3.551 1.074-4.502 2.721-1.921 3.328-.49 8.243 1.385 10.955.918 1.328 2.012 2.805 3.433 2.753 1.365-.052 1.884-.881 3.535-.881 1.636 0 2.115.881 3.551.854 1.481-.027 2.423-1.332 3.328-2.656 1.045-1.528 1.474-3.007 1.494-3.085-.034-.016-2.64-1.013-2.651-4.29zm-2.42-6.529c.758-.918 1.267-2.194 1.127-3.464-1.082.044-2.417.721-3.197 1.632-.697.809-1.309 2.106-1.144 3.359 1.205.093 2.456-.607 3.214-1.527z"
            fill="#000000"
          />
        </svg>
        <span className="text-[13px] hidden sm:inline">Apple</span>
      </Button>
    </div>
  )
}
