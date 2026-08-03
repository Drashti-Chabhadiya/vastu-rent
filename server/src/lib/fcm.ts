import admin from 'firebase-admin'
import { prisma } from '../config/prisma.js'

let initialized = false

function initAdmin() {
  if (initialized) return
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set; FCM disabled')
    return
  }

  try {
    const cred = JSON.parse(serviceAccount)
    admin.initializeApp({
      credential: admin.credential.cert(cred),
    })
    initialized = true
  } catch (err) {
    console.error('Failed to init firebase-admin:', err)
  }
}

export interface PushPayload {
  title: string
  body: string
  /** URL path to navigate to when notification is tapped, e.g. "/notifications" */
  url?: string
  /** Optional image URL to display inside the notification banner */
  image?: string
  /** Extra arbitrary data */
  data?: Record<string, string>
}

/**
 * Send a push notification to all registered devices for a user.
 * Uses FCM HTTP v1 multicast (sendEachForMulticast) — replaces deprecated sendToDevice().
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  initAdmin()
  if (!initialized) return

  try {
    const tokenRows = await prisma.deviceToken.findMany({ where: { userId } })
    if (!tokenRows || tokenRows.length === 0) return

    const tokens = tokenRows.map((t) => t.token)

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.image,
      } as any,
      data: {
        ...(payload.data ?? {}),
        url: payload.url ?? '/notifications',
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // required for some Android versions
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'vastu_rent_default_v2',
          sound: 'default',
          color: '#0e623b',
          icon: 'ic_stat_name',
          imageUrl: payload.image || undefined,
          clickAction: 'OPEN_ACTIVITY_1',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/logo192.png',
          image: payload.image,
        },
        fcmOptions: {
          link: payload.url ?? '/notifications',
        },
      },
    }

    const response = await admin.messaging().sendEachForMulticast(message)

    // Clean up stale / invalid tokens
    const staleTokens: string[] = []
    response.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-argument'
        ) {
          staleTokens.push(tokens[idx])
        }
        console.warn(`FCM send failed for token[${idx}]:`, r.error?.message)
      }
    })

    if (staleTokens.length > 0) {
      await prisma.deviceToken.deleteMany({
        where: { token: { in: staleTokens } },
      })
      console.log(
        `Removed ${staleTokens.length} stale FCM token(s) for user ${userId}`,
      )
    }

    console.log(
      `FCM: sent to ${response.successCount}/${tokens.length} devices for user ${userId}`,
    )
  } catch (err) {
    console.error('FCM sendPushToUser error:', err)
  }
}

/**
 * Send a push notification to an arbitrary list of FCM tokens.
 * Useful for broadcasting to guest users or all devices.
 */
export async function sendPushToTokens(tokens: string[], payload: PushPayload) {
  initAdmin()
  if (!initialized || tokens.length === 0) return

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.image,
      } as any,
      data: {
        ...(payload.data ?? {}),
        url: payload.url ?? '/notifications',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'vastu_rent_default_v2',
          sound: 'default',
          color: '#0e623b',
          icon: 'ic_stat_name',
          imageUrl: payload.image || undefined,
          clickAction: 'OPEN_ACTIVITY_1',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/logo192.png',
          image: payload.image,
        },
        fcmOptions: {
          link: payload.url ?? '/notifications',
        },
      },
    }

    const MAX_BATCH_SIZE = 500
    for (let i = 0; i < tokens.length; i += MAX_BATCH_SIZE) {
      const batchTokens = tokens.slice(i, i + MAX_BATCH_SIZE)
      const batchMessage = { ...message, tokens: batchTokens }
      const response = await admin.messaging().sendEachForMulticast(batchMessage)
      
      const staleTokens: string[] = []
      response.responses.forEach((r, idx) => {
        if (!r.success) {
          const code = r.error?.code
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-argument'
          ) {
            staleTokens.push(batchTokens[idx])
          }
        }
      })
      if (staleTokens.length > 0) {
        await prisma.deviceToken.deleteMany({
          where: { token: { in: staleTokens } },
        })
      }
    }
  } catch (err) {
    console.error('FCM sendPushToTokens error:', err)
  }
}
