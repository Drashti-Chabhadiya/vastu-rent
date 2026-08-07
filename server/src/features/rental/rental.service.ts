import { prisma } from '../../config/prisma.js'
import { createAndDeliverNotification } from '../../lib/notification.js'
import { sendBookingAlertEmail } from '../../lib/mail.js'
import { syncGreenMemberStatus } from '../../lib/green-member.helper.js'
import { cacheDel, cacheDelPattern } from '../../lib/redis-cache.js'
import { CACHE_KEYS } from '../../constants/cache-keys.js'

export class RentalService {
  async createRental(data: {
    productId: string
    renterId: string
    startDate: string
    endDate: string
    totalPrice: number
    rentalFee: number
    depositAmount: number
    paymentMethod?: string
    couponCode?: string
  }) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    const rental = await prisma.$transaction(async (tx) => {
      // Check if product exists and get its user
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      })

      if (!product) throw new Error('Product not found')
      if (!product.isAvailable)
        throw new Error('This product is currently not available for rent.')

      // Check for overlapping rentals
      const overlappingRental = await tx.rental.findFirst({
        where: {
          productId: data.productId,
          status: { notIn: ['cancelled', 'returned', 'completed'] },
          OR: [
            {
              // Case 1: New rental starts during an existing rental
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      })

      if (overlappingRental) {
        throw new Error(
          'This product is already booked for the selected dates.',
        )
      }

      let couponId: string | null = null
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() },
        })
        if (!coupon || !coupon.isActive) {
          throw new Error('Invalid coupon code')
        }
        const now = new Date()
        if (
          now < new Date(coupon.startDate) ||
          now > new Date(coupon.endDate)
        ) {
          throw new Error('Coupon is expired or not active yet')
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error('Coupon limit reached')
        }
        if (coupon.perUserLimit) {
          const userUsageCount = await tx.rental.count({
            where: {
              renterId: data.renterId,
              couponId: coupon.id,
              status: { notIn: ['cancelled', 'rejected'] },
            },
          })
          if (userUsageCount >= coupon.perUserLimit) {
            const limitMsg =
              coupon.perUserLimit === 1
                ? 'You have already used this coupon code'
                : `This coupon can only be used ${coupon.perUserLimit} time(s) per user`
            throw new Error(limitMsg)
          }
        }
        couponId = coupon.id

        // Increment coupon usedCount
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      // For COD (Cash), we set status to pending initially so the lister can confirm/reject it
      const initialStatus = 'pending'

      const pickupOTP = Math.floor(100000 + Math.random() * 900000).toString()
      const returnOTP = Math.floor(100000 + Math.random() * 900000).toString()

      return tx.rental.create({
        data: {
          productId: data.productId,
          renterId: data.renterId,
          startDate,
          endDate,
          totalPrice: data.totalPrice,
          rentalFee: data.rentalFee,
          depositAmount: data.depositAmount,
          paymentMethod: data.paymentMethod || 'online',
          status: initialStatus,
          paymentStatus: 'pending',
          couponId,
          pickupOTP,
          returnOTP,
        } as any,
        include: {
          product: true,
          renter: { select: { name: true, email: true } },
        },
      })
    })

    // Generate real-time DB notification for the product lister
    try {
      await createAndDeliverNotification({
        userId: rental.product.userId,
        title: 'New Booking Request! 📦',
        message: `You have received a new booking request from ${rental.renter.name} for "${rental.product.title}".`,
        type: 'booking',
        url: `/journal`,
      })
    } catch (err) {
      console.error(
        'Failed to deliver booking request notification to lister:',
        err,
      )
    }

    // Send email alert to product lister if preference is enabled
    try {
      const userObj = await prisma.user.findUnique({
        where: { id: rental.product.userId },
        select: { name: true, email: true, bookingAlerts: true },
      })

      if (userObj && userObj.bookingAlerts !== false) {
        await sendBookingAlertEmail({
          email: userObj.email,
          name: userObj.name || 'Lister',
          title: 'New Booking Request! 📦',
          message: `You have received a new booking request from ${rental.renter.name} for "${rental.product.title}". Please log in to your dashboard to review and manage this request.`,
          type: 'booking_request',
        })
      }
    } catch (err) {
      console.error('Failed to send booking alert email to lister:', err)
    }

    try {
      await Promise.all([
        cacheDel([
          CACHE_KEYS.PRODUCT_DETAIL(data.productId),
          CACHE_KEYS.PRODUCTS_RECENT,
        ]),
        cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN),
      ])
    } catch (err) {
      console.error(
        'Failed to invalidate product cache on booking creation:',
        err,
      )
    }

    try {
      await syncGreenMemberStatus(data.renterId)
    } catch (err) {
      console.error(
        'Failed to sync Green Member status on booking creation:',
        err,
      )
    }

    return rental
  }

  async getMyRentals(userId: string) {
    return prisma.rental.findMany({
      where: { renterId: userId },
      include: {
        product: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            reviews: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAllRentals() {
    return prisma.rental.findMany({
      include: {
        product: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        renter: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getStats() {
    const [rentalCount, totalRevenue] = await Promise.all([
      prisma.rental.count(),
      prisma.rental.aggregate({
        _sum: {
          totalPrice: true,
        },
      }),
    ])

    return {
      totalBookings: rentalCount,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    }
  }
  async getUserOrders(userId: string) {
    return prisma.rental.findMany({
      where: {
        product: { userId },
      },
      include: {
        product: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        renter: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getProductRentals(productId: string) {
    return prisma.rental.findMany({
      where: {
        productId,
        status: { notIn: ['cancelled'] },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    })
  }

  async updateRentalStatus(
    id: string,
    status: string,
    paymentStatus?: string,
    transactionId?: string,
    txClient?: any,
  ) {
    const runUpdate = async (db: any) => {
      const rentalBefore = await db.rental.findUnique({
        where: { id },
        select: { status: true, couponId: true },
      })

      const updatedRental = await db.rental.update({
        where: { id },
        data: {
          status,
          paymentStatus: paymentStatus || undefined,
          transactionId: transactionId || undefined,
        } as any,
        include: {
          product: true,
          renter: true,
        },
      })

      if (
        rentalBefore &&
        rentalBefore.couponId &&
        (status === 'cancelled' || status === 'rejected') &&
        rentalBefore.status !== 'cancelled' &&
        rentalBefore.status !== 'rejected'
      ) {
        const coupon = await db.coupon.findUnique({
          where: { id: rentalBefore.couponId },
        })
        if (coupon && coupon.usedCount > 0) {
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { decrement: 1 } },
          })
        }
      }
      return updatedRental
    }

    const updatedRental = txClient
      ? await runUpdate(txClient)
      : await prisma.$transaction(async (tx) => runUpdate(tx))

    // Generate real-time DB notifications for the customer/renter
    try {
      if (status === 'active' || status === 'confirmed') {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: 'Booking Confirmed! 🎉',
          message: `Your booking request for "${updatedRental.product.title}" has been successfully confirmed.`,
          type: 'booking',
          url: `/journal`,
        })
      }

      if (status === 'cancelled' || status === 'rejected') {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: 'Booking Rejected ❌',
          message: `Your booking request for "${updatedRental.product.title}" was rejected by the lister.`,
          type: 'alert',
          url: `/journal`,
        })
      } else if (status === 'completed' || status === 'returned') {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: 'Rental Completed! 🎉',
          message: `Your rental period for "${updatedRental.product.title}" has ended. Please leave a review!`,
          type: 'booking',
          url: `/journal`,
        })
      }
    } catch (err) {
      console.error('Failed to deliver notification for renter:', err)
    }

    // Send email alert to renter if preference is enabled
    try {
      if (
        updatedRental.renter &&
        updatedRental.renter.bookingAlerts !== false
      ) {
        let title = ''
        let message = ''
        let type = 'booking_status'

        if (status === 'active' || status === 'confirmed') {
          title = 'Booking Confirmed! 🎉'
          message = `Your booking request for "${updatedRental.product.title}" has been successfully confirmed.`
        } else if (status === 'cancelled' || status === 'rejected') {
          title = 'Booking Rejected ❌'
          message = `Your booking request for "${updatedRental.product.title}" was rejected by the lister.`
        } else if (status === 'completed' || status === 'returned') {
          title = 'Rental Completed! 🎉'
          message = `Your rental period for "${updatedRental.product.title}" has ended. Please leave a review!`
          type = 'booking_completed'
        }

        if (title && message) {
          await sendBookingAlertEmail({
            email: updatedRental.renter.email,
            name: updatedRental.renter.name || 'Customer',
            title,
            message,
            type,
          })
        }
      }
    } catch (err) {
      console.error('Failed to send booking alert email to renter:', err)
    }

    try {
      await syncGreenMemberStatus(updatedRental.renterId)
    } catch (err) {
      console.error(
        'Failed to sync Green Member status on booking status update:',
        err,
      )
    }

    return updatedRental
  }

  async verifyPickupOTP(
    id: string,
    otp: string,
    userId: string,
    userRole: string,
  ) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!rental) {
      throw new Error('Rental booking not found')
    }

    if (rental.status !== 'confirmed') {
      throw new Error('Rental booking is not in a confirmed state')
    }

    const isAdmin = userRole === 'admin'
    if (!isAdmin && rental.product.userId !== userId) {
      throw new Error(
        'You are not authorized to manage bookings for this product',
      )
    }

    if (rental.pickupOTP !== otp) {
      throw new Error('Incorrect Pickup OTP code')
    }

    return this.updateRentalStatus(id, 'picked_up', 'paid')
  }

  async verifyReturnOTP(
    id: string,
    otp: string,
    userId: string,
    userRole: string,
  ) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!rental) {
      throw new Error('Rental booking not found')
    }

    if (rental.status !== 'picked_up') {
      throw new Error('Rental booking is not in a picked up state')
    }

    const isAdmin = userRole === 'admin'
    if (!isAdmin && rental.product.userId !== userId) {
      throw new Error(
        'You are not authorized to manage bookings for this product',
      )
    }

    if (rental.returnOTP !== otp) {
      throw new Error('Incorrect Return OTP code')
    }

    return this.updateRentalStatus(id, 'completed')
  }
}

export const rentalService = new RentalService()
