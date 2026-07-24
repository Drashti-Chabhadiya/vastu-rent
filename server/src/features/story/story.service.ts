import { prisma } from '../../config/prisma.js'

export const StoryService = {
  async getAllStories() {
    return prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })
  },

  async getStoryById(id: string) {
    return prisma.story.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })
  },

  async createStory(data: {
    title: string
    excerpt: string
    content?: string
    tag: string
    readTime: string
    imageUrl: string
    authorId: string
  }) {
    return prisma.story.create({
      data,
    })
  },

  async updateStory(
    id: string,
    data: {
      title?: string
      excerpt?: string
      content?: string
      tag?: string
      readTime?: string
      imageUrl?: string
    },
  ) {
    return prisma.story.update({
      where: { id },
      data,
    })
  },

  async deleteStory(id: string) {
    return prisma.story.delete({
      where: { id },
    })
  },
}
