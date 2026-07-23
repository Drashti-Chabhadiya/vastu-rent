import { FastifyRequest, FastifyReply } from 'fastify'
import { rentalService } from './rental.service.js'
import { prisma } from '../../config/prisma.js'
import { isAdminRole, isDashboardRole } from '../../config/roles.js'

export class RentalController {
  async createRental(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user.id
    const rental = await rentalService.createRental({
      ...(request.body as any),
      renterId: userId,
    })
    return { rental }
  }

  async getMyRentals(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user.id
    const rentals = await rentalService.getMyRentals(userId)
    return { rentals }
  }

  async getAllRentals(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    if (!isAdminRole(user.role)) {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Admin access required' })
    }
    const rentals = await rentalService.getAllRentals()
    return { rentals }
  }

  async getOrders(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user

    if (!isDashboardRole(user.role)) {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Access restricted to Users and Admins' })
    }

    if (isAdminRole(user.role)) {
      const rentals = await rentalService.getAllRentals()
      return { rentals }
    }

    const rentals = await rentalService.getUserOrders(user.id)
    return { rentals }

    return { rentals: [] }
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    const user = (request as any).user

    // Retrieve rental with its linked product details
    const rentalExists = await prisma.rental.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!rentalExists) {
      return reply.status(404).send({ message: 'Booking request not found' })
    }

    // Role-based permissions validation: Only admin or the actual listing user can update status
    if (!isAdminRole(user.role)) {
      if (!isDashboardRole(user.role)) {
        return reply
          .status(403)
          .send({ message: 'Forbidden: User permissions required' })
      }
      if (rentalExists.product.userId !== user.id) {
        return reply.status(403).send({
          message:
            'Forbidden: You are not authorized to manage bookings for this product',
        })
      }
    }

    const rental = await rentalService.updateRentalStatus(id, status)
    return { rental }
  }

  async getProductRentals(request: FastifyRequest, _reply: FastifyReply) {
    const { productId } = request.params as { productId: string }
    const rentals = await rentalService.getProductRentals(productId)
    return { rentals }
  }

  async verifyPickupOTP(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { otp } = request.body as { otp: string }
    const user = (request as any).user

    try {
      const rental = await rentalService.verifyPickupOTP(
        id,
        otp,
        user.id,
        user.role,
      )
      return { rental }
    } catch (err: any) {
      return reply
        .status(400)
        .send({ message: err.message || 'Failed to verify Pickup OTP' })
    }
  }

  async verifyReturnOTP(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { otp } = request.body as { otp: string }
    const user = (request as any).user

    try {
      const rental = await rentalService.verifyReturnOTP(
        id,
        otp,
        user.id,
        user.role,
      )
      return { rental }
    } catch (err: any) {
      return reply
        .status(400)
        .send({ message: err.message || 'Failed to verify Return OTP' })
    }
  }
}

export const rentalController = new RentalController()
