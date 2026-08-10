import { prisma } from '../config/prisma.js'
import { broadcastToUser } from './supabase.js'
import { sendPushToUser, sendPushToTokens } from './fcm.js'

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

    // Emit via Supabase Realtime to user's channel (foreground real-time update)
    try {
      console.log(
        `[Supabase Realtime] Emitting notification to user_${userId}:`,
        {
          ...notif,
          url,
          image,
        },
      )
      await broadcastToUser(userId, 'notification', { ...notif, url, image })
    } catch (err) {
      console.error('Supabase broadcast failed for notification:', err)
    }

    // Direct FCM push notification
    try {
      await sendPushToUser(userId, {
        title,
        body: message,
        url,
        image: image || '',
        data: {
          id: notif.id,
          type,
          url,
          image: image || '',
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
          console.error(
            `Failed to deliver notification to admin ${admin.id}:`,
            err,
          ),
        ),
      ),
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
}: Omit<NotificationOptions, 'userId'> & {
  image?: string
  excludeUserId?: string
}) {
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
          console.error(`Failed to deliver notification to user ${u.id}:`, err),
        ),
      ),
    )

    // Send to guest devices (userId = null)
    try {
      const guestTokens = await prisma.deviceToken.findMany({
        where: { userId: null },
        select: { token: true },
      })
      if (guestTokens.length > 0) {
        await sendPushToTokens(
          guestTokens.map((t) => t.token),
          {
            title,
            body: message,
            url,
            image,
            data: { type, url, image: image || '' },
          },
        )
      }
    } catch (err) {
      console.error('Failed to notify guest users:', err)
    }
  } catch (err) {
    console.error('Failed to notify all users:', err)
  }
}
