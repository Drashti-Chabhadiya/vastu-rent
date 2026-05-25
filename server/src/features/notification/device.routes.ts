import { FastifyInstance } from 'fastify'
import { deviceController } from './device.controller.js'

export async function deviceRoutes(fastify: FastifyInstance) {
  fastify.post('/register', deviceController.register)
  fastify.post('/unregister', deviceController.unregister)
}
