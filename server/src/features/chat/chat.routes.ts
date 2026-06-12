import { FastifyInstance } from "fastify";
import { chatController } from "./chat.controller.js";
import { auth } from "../../config/auth.js";

export async function chatRoutes(fastify: FastifyInstance) {
  // Pre-handler check to ensure the user is logged in
  fastify.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    (request as any).chatSession = session;
  });

  fastify.get("/conversations", chatController.getConversations);
  fastify.get("/conversations/:id/messages", chatController.getMessages);
  fastify.post("/conversations", chatController.getOrCreateConversation);
  fastify.delete("/conversations/:id", chatController.deleteConversation);
  fastify.get("/users/search", chatController.searchUsers);
  fastify.post("/upload", chatController.uploadChatAttachment);
  fastify.put("/messages/:id", chatController.editMessage);
  fastify.delete("/messages/:id", chatController.deleteMessage);
  fastify.post("/messages/:id/forward", chatController.forwardMessage);

  // Phase 2 WhatsApp Features
  fastify.post("/messages/:id/star", chatController.toggleStarMessage);
  fastify.post("/messages/:id/pin", chatController.togglePinMessage);
  fastify.post("/messages/:id/react", chatController.addMessageReaction);
  fastify.delete("/messages/:id/react", chatController.removeMessageReaction);
  fastify.post("/conversations/:id/pin", chatController.togglePinConversation);
  fastify.post("/conversations/:id/mute", chatController.toggleMuteConversation);
  fastify.post("/conversations/:id/clear", chatController.clearChat);
  fastify.post("/conversations/:id/disappearing", chatController.setDisappearingMessages);
}
