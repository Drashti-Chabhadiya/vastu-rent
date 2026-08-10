import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'
import { isUserOnline } from '../user/user.controller.js'
import { cloudinaryService } from '../upload/cloudinary.service.js'

export const chatUploadController = {
  async searchUsers(request: FastifyRequest, reply: FastifyReply) {
    const { q } = request.query as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id
    const userShowOnline = (session.user as any).showOnline !== false

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        banned: false,
        name: q ? { contains: q, mode: 'insensitive' } : undefined,
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        showProfile: true,
        showOnline: true,
        lastActive: true,
        isGreenMember: true,
      },
      take: 15,
      orderBy: { name: 'asc' },
    })

    return users.map((u) => {
      const otherUserShowOnline = u.showOnline !== false
      const canSeeStatus = userShowOnline && otherUserShowOnline

      return {
        id: u.id,
        name: u.name,
        role: u.role,
        image: u.showProfile === false ? null : u.image,
        isOnline: canSeeStatus ? isUserOnline(u.lastActive) : false,
        lastActive: canSeeStatus ? u.lastActive : null,
        isGreenMember: u.isGreenMember === true,
      }
    })
  },

  async uploadChatAttachment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session =
        (request as any).chatSession ||
        (await auth.api.getSession({ headers: request.headers as any }))
      if (!session) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      const userId = session.user.id

      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' })
      }

      const allowedMimePrefixes = ['image/', 'audio/', 'video/']
      const allowedMimetypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
      ]
      const isAllowed =
        allowedMimePrefixes.some((prefix) =>
          data.mimetype.startsWith(prefix),
        ) || allowedMimetypes.includes(data.mimetype)

      if (!isAllowed) {
        return reply.status(400).send({
          message:
            'Only image, audio, video, and document files (PDF, Word, Text, Zip) are allowed.',
        })
      }

      const buffer = await data.toBuffer()
      const base64 = `data:${data.mimetype};base64,${buffer.toString('base64')}`

      let url: string
      try {
        const result = await cloudinaryService.uploadImage(
          base64,
          'chat',
          userId,
        )
        url = result.url
      } catch {
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          const result = await cloudinaryService.uploadImage(base64, 'chat')
          url = result.url
        } else {
          return reply.status(500).send({
            message:
              'Cloudinary is not configured. Please set up your credentials in settings.',
          })
        }
      }

      return reply.send({ url })
    } catch (error: any) {
      console.error('Chat Attachment Upload Error:', error)
      return reply
        .status(500)
        .send({ message: error.message || 'Upload failed' })
    }
  },
}
