import type { FastifyInstance } from 'fastify'
import { StoryController } from "./story.controller.js";

export async function storyRoutes(fastify: FastifyInstance) {
  // Public route to get stories
  fastify.get('/', StoryController.getAllStories)

  // Get a single story by ID
  fastify.get('/:id', StoryController.getStoryById)

  // Admin route to create a story
  fastify.post('/', StoryController.createStory)

  // Admin route to update a story
  fastify.put('/:id', StoryController.updateStory)

  // Admin route to delete a story
  fastify.delete('/:id', StoryController.deleteStory)
}
