import type { FastifyRequest, FastifyReply } from 'fastify'
import { StoryService } from './story.service.js'
import { auth } from '../../config/auth.js'
import { isAdminRole } from '../../config/roles.js'

export const StoryController = {
  async getAllStories(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const stories = await StoryService.getAllStories()
      return { success: true, stories }
    } catch (error: any) {
      return reply.code(500).send({ success: false, message: error.message })
    }
  },

  async getStoryById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const story = await StoryService.getStoryById(id)
      if (!story) {
        return reply.code(404).send({ success: false, message: 'Story not found' })
      }
      return { success: true, story }
    } catch (error: any) {
      return reply.code(500).send({ success: false, message: error.message })
    }
  },

  async createStory(request: any, reply: FastifyReply) {
    try {
      // Require admin
      const session = await auth.api.getSession({ headers: request.headers as any })
      if (!session || !session.user) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' })
      }
      if (!isAdminRole(session.user.role)) {
        return reply.code(403).send({ success: false, message: 'Forbidden: Only Admins can manage stories' })
      }

      const { title, excerpt, content, tag, readTime, imageUrl } = request.body
      const story = await StoryService.createStory({
        title,
        excerpt,
        content,
        tag,
        readTime,
        imageUrl,
        authorId: session.user.id
      })
      return { success: true, story }
    } catch (error: any) {
      return reply.code(500).send({ success: false, message: error.message })
    }
  },

  async updateStory(request: any, reply: FastifyReply) {
    try {
      // Require admin
      const session = await auth.api.getSession({ headers: request.headers as any })
      if (!session || !session.user) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' })
      }
      if (!isAdminRole(session.user.role)) {
        return reply.code(403).send({ success: false, message: 'Forbidden: Only Admins can manage stories' })
      }

      const { id } = request.params
      const { title, excerpt, content, tag, readTime, imageUrl } = request.body
      const story = await StoryService.updateStory(id, {
        title,
        excerpt,
        content,
        tag,
        readTime,
        imageUrl
      })
      return { success: true, story }
    } catch (error: any) {
      return reply.code(500).send({ success: false, message: error.message })
    }
  },

  async deleteStory(request: any, reply: FastifyReply) {
    try {
      // Require admin
      const session = await auth.api.getSession({ headers: request.headers as any })
      if (!session || !session.user) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' })
      }
      if (!isAdminRole(session.user.role)) {
        return reply.code(403).send({ success: false, message: 'Forbidden: Only Admins can manage stories' })
      }

      const { id } = request.params
      await StoryService.deleteStory(id)
      return { success: true, message: 'Story deleted successfully' }
    } catch (error: any) {
      return reply.code(500).send({ success: false, message: error.message })
    }
  }
}
