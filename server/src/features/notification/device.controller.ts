import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'

export class DeviceController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    const userId = session?.user?.id || null

    const { token, platform } = request.body as any
    if (!token) return reply.status(400).send({ message: 'Token required' })

    try {
      await prisma.deviceToken.upsert({
        where: { token },
        create: { token, platform, userId },
        update: { platform, userId },
      })
      return { success: true }
    } catch (err) {
      console.error('Register device token failed:', err)
      return reply.status(500).send({ message: 'Failed to register' })
    }
  }

  async unregister(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })

    const { token } = request.body as any
    if (!token) return reply.status(400).send({ message: 'Token required' })

    try {
      await prisma.deviceToken.updateMany({
        where: { token, userId: session.user.id },
        data: { userId: null },
      })
      return { success: true }
    } catch (err) {
      console.error('Unregister device token failed:', err)
      return reply.status(500).send({ message: 'Failed to unregister' })
    }
  }
}

export const deviceController = new DeviceController()
