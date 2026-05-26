import { prisma } from '../config/prisma.js'
import { io } from './socket.js'
import { sendPushToUser } from './fcm.js'

export interface NotificationOptions {
  userId: string
  title: string
  message: string
  type?: string
  /**
   * URL path the user should land on when they tap the notification.
   * e.g. '/rentals/abc123', '/notifications', '/chat/xyz'
   * Defaults to '/notifications'.
   */
  url?: string
}

export async function createAndDeliverNotification({
  userId,
  title,
  message,
  type = 'info',
  url = '/notifications',
}: NotificationOptions) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, title, message, type },
    })

    // Emit via socket.io to user's room (foreground real-time update)
    try {
      io?.to(`user_${userId}`).emit('notification', notif)
    } catch (err) {
      console.error('Socket emit failed for notification:', err)
    }

    // Send FCM push notification (background / lock screen / banner)
    try {
      await sendPushToUser(userId, {
        title,
        body: message,
        url,
        data: {
          id: notif.id,
          type,
          url,
        },
      })
    } catch (err) {
      console.error('FCM send failed for notification:', err)
    }

    return notif
  } catch (err) {
    console.error('Failed to create notification:', err)
    throw err
  }
}
