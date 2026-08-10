import { FastifyInstance } from 'fastify'
import { conversationController } from './conversation.controller.js'
import { messageController } from './message.controller.js'
import { chatUploadController } from './chat-upload.controller.js'
import { auth } from '../../config/auth.js'

export async function chatRoutes(fastify: FastifyInstance) {
  // Pre-handler check to ensure the user is logged in
  fastify.addHook('preHandler', async (request, reply) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    ;(request as any).chatSession = session
  })

  fastify.get('/conversations', conversationController.getConversations)
  fastify.get('/conversations/:id/messages', messageController.getMessages)
  fastify.post('/conversations/:id/messages', messageController.sendMessage)
  fastify.post('/conversations/:id/typing', messageController.sendTyping)
  fastify.post('/conversations/:id/read', messageController.markRead)
  fastify.post('/conversations', conversationController.getOrCreateConversation)
  fastify.delete(
    '/conversations/:id',
    conversationController.deleteConversation,
  )
  fastify.get('/users/search', chatUploadController.searchUsers)
  fastify.post('/upload', chatUploadController.uploadChatAttachment)
  fastify.put('/messages/:id', messageController.editMessage)
  fastify.delete('/messages/:id', messageController.deleteMessage)
  fastify.post('/messages/:id/forward', messageController.forwardMessage)

  // Phase 2 WhatsApp Features
  fastify.post('/messages/:id/star', messageController.toggleStarMessage)
  fastify.post('/messages/:id/pin', messageController.togglePinMessage)
  fastify.post('/messages/:id/react', messageController.addMessageReaction)
  fastify.delete('/messages/:id/react', messageController.removeMessageReaction)
  fastify.post(
    '/conversations/:id/pin',
    conversationController.togglePinConversation,
  )
  fastify.post(
    '/conversations/:id/mute',
    conversationController.toggleMuteConversation,
  )
  fastify.post(
    '/conversations/:id/archive',
    conversationController.archiveConversation,
  )
  fastify.post(
    '/conversations/:id/unarchive',
    conversationController.unarchiveConversation,
  )
  fastify.post('/conversations/:id/clear', conversationController.clearChat)
  fastify.post(
    '/conversations/:id/disappearing',
    conversationController.setDisappearingMessages,
  )
  fastify.patch(
    '/conversations/:id/settings',
    conversationController.updateConversationSettings,
  )
  fastify.post(
    '/conversations/:id/block',
    conversationController.blockConversation,
  )
  fastify.post(
    '/conversations/:id/unblock',
    conversationController.unblockConversation,
  )
  fastify.post(
    '/conversations/:id/report',
    conversationController.reportConversation,
  )
}
