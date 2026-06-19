import { prisma } from '../config/prisma.js'
import { io } from './socket.js'
import { sendPushToUser } from './fcm.js'
import { notificationQueue } from '../queues/queues.js'
import { JOB_NAMES } from '../constants/queue-keys.js'

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
  /**
   * Optional image URL to display in notification banners
   */
  image?: string
}

export async function createAndDeliverNotification({
  userId,
  title,
  message,
  type = 'info',
  url = '/notifications',
  image,
}: NotificationOptions) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, title, message, type, url },
    })

    // Emit via socket.io to user's room (foreground real-time update)
    try {
      console.log(`[Socket] Emitting notification to user_${userId}:`, { ...notif, url, image })
      io?.to(`user_${userId}`).emit('notification', { ...notif, url, image })
    } catch (err) {
      console.error('Socket emit failed for notification:', err)
    }

    // Offload FCM push notification to background queue
    try {
      await notificationQueue.add(JOB_NAMES.NOTIFICATION.PUSH_NOTIFICATION, {
        userId,
        title,
        body: message,
        url,
        image,
        data: {
          id: notif.id,
          type,
          url,
          image: image || '',
        },
      })
    } catch (err) {
      console.error('FCM send queuing failed for notification:', err)
    }

    return notif
  } catch (err) {
    console.error('Failed to create notification:', err)
    throw err
  }
}

export async function notifyAllAdmins({
  title,
  message,
  type = 'info',
  url = '/notifications',
}: Omit<NotificationOptions, 'userId'>) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    await Promise.all(
      admins.map((admin) =>
        createAndDeliverNotification({
          userId: admin.id,
          title,
          message,
          type,
          url,
        }).catch((err) =>
          console.error(`Failed to deliver notification to admin ${admin.id}:`, err)
        )
      )
    )
  } catch (err) {
    console.error('Failed to notify admins:', err)
  }
}

export async function notifyAllUsers({
  title,
  message,
  type = 'info',
  url = '/notifications',
  image,
  excludeUserId,
}: Omit<NotificationOptions, 'userId'> & { image?: string; excludeUserId?: string }) {
  try {
    const users = await prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : {},
      select: { id: true },
    })

    await Promise.all(
      users.map((u) =>
        createAndDeliverNotification({
          userId: u.id,
          title,
          message,
          type,
          url,
          image,
        }).catch((err) =>
          console.error(`Failed to deliver notification to user ${u.id}:`, err)
        )
      )
    )
  } catch (err) {
    console.error('Failed to notify all users:', err)
  }
}
