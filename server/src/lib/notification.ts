// import { prisma } from './prisma.js'
import { prisma } from "../config/prisma.js";
import { io } from './socket.js'
import { sendPushToUser } from './fcm.js'

export async function createAndDeliverNotification({ userId, title, message, type = 'info' }: { userId: string; title: string; message: string; type?: string }) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, title, message, type },
    })

    // Emit via socket.io to user's room
    try {
      io?.to(`user_${userId}`).emit('notification', notif)
    } catch (err) {
      console.error('Socket emit failed for notification:', err)
    }

    // Send push via FCM
    try {
      await sendPushToUser(userId, {
        notification: {
          title,
          body: message,
        },
        data: { id: notif.id, type },
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
