import { FastifyRequest, FastifyReply } from 'fastify'
import { addressService } from './address.service.js'

export class AddressController {
  async getUserAddresses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const addresses = await addressService.getUserAddresses(userId)
      return reply.send({ addresses })
    } catch (error: any) {
      return reply
        .status(500)
        .send({ message: error.message || 'Internal server error' })
    }
  }

  async getAddressById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const { id } = request.params as any
      const address = await addressService.getAddressById(id, userId)
      return reply.send({ address })
    } catch (error: any) {
      return reply
        .status(404)
        .send({ message: error.message || 'Address not found' })
    }
  }

  async createAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const address = await addressService.createAddress(
        userId,
        request.body as any,
      )
      return reply.status(201).send({ address })
    } catch (error: any) {
      return reply
        .status(400)
        .send({ message: error.message || 'Failed to create address' })
    }
  }

  async updateAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const { id } = request.params as any
      const address = await addressService.updateAddress(
        id,
        userId,
        request.body as any,
      )
      return reply.send({ address })
    } catch (error: any) {
      return reply
        .status(400)
        .send({ message: error.message || 'Failed to update address' })
    }
  }

  async deleteAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const { id } = request.params as any
      const result = await addressService.deleteAddress(id, userId)
      return reply.send(result)
    } catch (error: any) {
      return reply
        .status(400)
        .send({ message: error.message || 'Failed to delete address' })
    }
  }

  async setDefaultAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id
      const { id } = request.params as any
      const address = await addressService.setDefaultAddress(id, userId)
      return reply.send({ address })
    } catch (error: any) {
      return reply
        .status(400)
        .send({ message: error.message || 'Failed to set default address' })
    }
  }
}

export const addressController = new AddressController()
