import admin from 'firebase-admin'
// import { prisma } from './prisma.js'
import { prisma } from "../config/prisma.js";

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

export async function sendPushToUser(userId: string, payload: admin.messaging.MessagingPayload | admin.messaging.Message) {
  initAdmin()
  if (!initialized) return

  try {
    const tokens = await prisma.deviceToken.findMany({ where: { userId } })
    if (!tokens || tokens.length === 0) return

    const deviceTokens = tokens.map((t) => t.token)

    // If payload looks like MessagingPayload, use sendToDevice; otherwise send message
    if ((payload as any).notification || (payload as any).data) {
      const res = await admin.messaging().sendToDevice(deviceTokens, payload as admin.messaging.MessagingPayload)
      // Handle token cleanup for invalid tokens
      const toRemove: string[] = []
      res.results.forEach((r, idx) => {
        const err = r.error
        if (err && (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered')) {
          toRemove.push(deviceTokens[idx])
        }
      })
      if (toRemove.length) {
        await prisma.deviceToken.deleteMany({ where: { token: { in: toRemove } } })
      }
    } else {
      // generic message
      await admin.messaging().send({ tokens: deviceTokens, ...(payload as any) })
    }
  } catch (err) {
    console.error('FCM send error:', err)
  }
}
