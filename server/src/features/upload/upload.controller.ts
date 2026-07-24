import { FastifyRequest, FastifyReply } from 'fastify'
import { cloudinaryService } from './cloudinary.service.js'
import { prisma } from '../../config/prisma.js'
import { imageQueue } from '../../queues/queues.js'
import { JOB_NAMES } from '../../constants/queue-keys.js'

export class UploadController {
  async uploadProfileImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id
      if (!userId) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: Please log in.' })
      }

      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' })
      }

      const buffer = await data.toBuffer()
      const base64 = `data:${data.mimetype};base64,${buffer.toString('base64')}`

      // Upload using user's custom credentials
      const { url } = await cloudinaryService.uploadImage(
        base64,
        'profiles',
        userId,
      )

      // Get old image to delete it from their storage
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user?.image) {
        const oldPublicId = cloudinaryService.extractPublicId(user.image)
        if (oldPublicId) {
          await cloudinaryService.deleteImage(oldPublicId, userId)
        }
      }

      // Update user with new image
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { image: url },
      })

      // Queue user profile image optimization in background
      try {
        await imageQueue.add(JOB_NAMES.IMAGE.OPTIMIZE_IMAGE, {
          entityId: userId,
          entityType: 'user',
          imageUrls: [url],
        })
      } catch (err) {
        console.error('Failed to queue user profile image optimization:', err)
      }

      return { url, user: updatedUser }
    } catch (error: any) {
      console.error('Profile Image Upload Error:', error)
      return reply
        .status(400)
        .send({ message: error.message || 'Profile upload failed' })
    }
  }

  async uploadProductImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id
      if (!userId) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: Please log in.' })
      }

      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' })
      }

      const buffer = await data.toBuffer()
      const base64 = `data:${data.mimetype};base64,${buffer.toString('base64')}`

      // Upload using user's custom credentials
      const { url } = await cloudinaryService.uploadImage(
        base64,
        'products',
        userId,
      )
      return { url }
    } catch (error: any) {
      console.error('Product Image Upload Error:', error)
      return reply
        .status(400)
        .send({ message: error.message || 'Product image upload failed' })
    }
  }
}

export const uploadController = new UploadController()
