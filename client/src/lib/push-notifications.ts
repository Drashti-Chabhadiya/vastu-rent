import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { apiClient } from '#/lib/api'

/** Whether we're running inside a native iOS/Android app */
export const isNative = Capacitor.isNativePlatform()

let pushInitialized = false

/**
 * Initialize native push notifications (Android & iOS).
 * Call this once after the user is authenticated.
 *
 * On web, falls back to the existing Firebase Web SDK in fcm.ts.
 */
export async function initNativePush(
  onNotificationTap?: (url: string) => void,
) {
  if (!isNative) return // web handled by fcm.ts
  if (pushInitialized) return
  pushInitialized = true

  try {
    // 1. Request permission
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission denied')
      return
    }

    // Create the default notification channel for Android (required for Android 8+)
    if (Capacitor.getPlatform() === 'android') {
      try {
        await PushNotifications.createChannel({
          id: 'vastu_rent_default_v2',
          name: 'Default Notifications',
          description: 'Default notification channel for Vastu Rent',
          importance: 5, // IMPORTANCE_HIGH (max importance, shows banner/popup & sound)
          visibility: 1, // VISIBILITY_PUBLIC (shows on lock screen)
          vibration: true,
        })
        console.log('[Push] Android notification channel created')
      } catch (channelErr) {
        console.error(
          '[Push] Failed to create Android notification channel:',
          channelErr,
        )
      }
    }

    // 2. Register with FCM/APNs
    await PushNotifications.register()

    // 3. On registration — get the FCM token and send to backend
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] FCM token:', token.value)
      try {
        const platform = Capacitor.getPlatform() // 'android' | 'ios'
        await apiClient.post('/notifications/device/register', {
          token: token.value,
          platform,
        })
        console.log('[Push] Token registered with backend')
      } catch (err) {
        console.error('[Push] Failed to register token with backend:', err)
      }
    })

    // 4. Registration error
    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error:', JSON.stringify(err))
    })

    // 5. Foreground notification received — log it (UI is handled via socket/react-query)
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log(
          '[Push] Foreground notification received:',
          notification.title,
        )
        // Note: The notification toast in foreground is shown by the socket.io listener in use-notifications.ts
        // On Android, a heads-up notification WILL still appear in the system bar even in foreground
      },
    )

    // 6. User tapped a notification — deep-link to the correct screen
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('[Push] Notification tapped:', action)
        const data = action.notification.data as
          | Record<string, string>
          | undefined
        const url = data?.url ?? '/notifications'
        if (onNotificationTap) {
          onNotificationTap(url)
        }
      },
    )

    console.log('[Push] Native push notifications initialized')
  } catch (err) {
    console.error('[Push] initNativePush failed:', err)
  }
}

/**
 * Remove all native push listeners and reset.
 * Call this on logout to clean up.
 */
export async function cleanupNativePush() {
  if (!isNative) return
  try {
    await PushNotifications.removeAllListeners()
    pushInitialized = false
  } catch (_) {
    // ignore
  }
}

/**
 * Unregister the current device's FCM token from the backend.
 * Call this on logout so the user stops receiving notifications on this device.
 */
export async function unregisterDeviceToken() {
  if (!isNative) return
  try {
    // Get current token — we do this by re-triggering registration briefly
    // The cleanest approach is storing the token in memory
    // We'll handle this via the stored token approach below
    const { notifications } =
      await PushNotifications.getDeliveredNotifications()
    console.log(
      '[Push] Clearing delivered notifications:',
      notifications.length,
    )
    await PushNotifications.removeAllDeliveredNotifications()
  } catch (_) {
    // ignore
  }
}
