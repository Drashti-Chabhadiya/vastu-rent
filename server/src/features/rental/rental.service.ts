import { prisma } from "../../config/prisma.js";

export class RentalService {
  async createRental(data: {
    productId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    rentalFee: number;
    depositAmount: number;
    paymentMethod?: string;
    couponCode?: string;
  }) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const rental = await prisma.$transaction(async (tx) => {
      // Check if product exists and get its owner
      const product = await tx.product.findUnique({
        where: { id: data.productId }
      });

      if (!product) throw new Error("Product not found");
      if (!product.isAvailable) throw new Error("This product is currently not available for rent.");

      // Check for overlapping rentals
      const overlappingRental = await tx.rental.findFirst({
        where: {
          productId: data.productId,
          status: { notIn: ["cancelled", "returned", "completed"] },
          OR: [
            {
              // Case 1: New rental starts during an existing rental
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      if (overlappingRental) {
        throw new Error("This product is already booked for the selected dates.");
      }

      let couponId: string | null = null;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() }
        });
        if (!coupon || !coupon.isActive) {
          throw new Error("Invalid coupon code");
        }
        const now = new Date();
        if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
          throw new Error("Coupon is expired or not active yet");
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("Coupon limit reached");
        }
        if (coupon.perUserLimit) {
          const userUsageCount = await tx.rental.count({
            where: {
              renterId: data.renterId,
              couponId: coupon.id,
              status: { notIn: ["cancelled", "rejected"] }
            }
          });
          if (userUsageCount >= coupon.perUserLimit) {
            const limitMsg = coupon.perUserLimit === 1
              ? "You have already used this coupon code"
              : `This coupon can only be used ${coupon.perUserLimit} time(s) per user`;
            throw new Error(limitMsg);
          }
        }
        couponId = coupon.id;

        // Increment coupon usedCount
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // For COD (Cash), we set status to pending initially so the owner can confirm/reject it
      const initialStatus = "pending";

      return tx.rental.create({
        data: {
          productId: data.productId,
          renterId: data.renterId,
          startDate,
          endDate,
          totalPrice: data.totalPrice,
          rentalFee: data.rentalFee,
          depositAmount: data.depositAmount,
          paymentMethod: data.paymentMethod || "online",
          status: initialStatus,
          paymentStatus: "pending",
          couponId,
        } as any,
        include: {
          product: true,
          renter: { select: { name: true, email: true } }
        }
      });
    });

    // Generate real-time DB notification for the product owner
    try {
      const { createAndDeliverNotification } = await import('../../lib/notification.js');
      await createAndDeliverNotification({
        userId: rental.product.ownerId,
        title: "New Booking Request! 📦",
        message: `You have received a new booking request from ${rental.renter.name} for "${rental.product.title}".`,
        type: "booking",
        url: `/journal`,
      });
    } catch (err) {
      console.error("Failed to deliver booking request notification to owner:", err);
    }

    // Send email alert to product owner if preference is enabled
    try {
      const owner = await prisma.user.findUnique({
        where: { id: rental.product.ownerId },
        select: { name: true, email: true, bookingAlerts: true }
      });

      if (owner && owner.bookingAlerts !== false) {
        const { sendBookingAlertEmail } = await import('../../lib/mail.js');
        await sendBookingAlertEmail({
          email: owner.email,
          name: owner.name || "Owner",
          title: "New Booking Request! 📦",
          message: `You have received a new booking request from ${rental.renter.name} for "${rental.product.title}". Please log in to your dashboard to review and manage this request.`,
          type: "booking_request",
        });
      }
    } catch (err) {
      console.error("Failed to send booking alert email to owner:", err);
    }

    return rental;
  }

  async getMyRentals(userId: string) {
    return prisma.rental.findMany({
      where: { renterId: userId },
      include: {
        product: {
          include: {
            category: true,
            reviews: {
              where: { userId }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllRentals() {
    return prisma.rental.findMany({
      include: {
        product: { include: { category: true } },
        renter: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getStats() {
    const [rentalCount, totalRevenue] = await Promise.all([
      prisma.rental.count(),
      prisma.rental.aggregate({
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      totalBookings: rentalCount,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }
  async getOwnerOrders(ownerId: string) {
    return prisma.rental.findMany({
      where: {
        product: { ownerId: ownerId }
      },
      include: {
        product: { include: { category: true } },
        renter: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductRentals(productId: string) {
    return prisma.rental.findMany({
      where: {
        productId,
        status: { notIn: ["cancelled"] }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });
  }

  async updateRentalStatus(id: string, status: string, paymentStatus?: string, transactionId?: string) {
    const rentalBefore = await prisma.rental.findUnique({
      where: { id },
      select: { status: true, couponId: true }
    });

    const updatedRental = await prisma.rental.update({
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
    });

    if (
      rentalBefore &&
      rentalBefore.couponId &&
      (status === "cancelled" || status === "rejected") &&
      rentalBefore.status !== "cancelled" &&
      rentalBefore.status !== "rejected"
    ) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { id: rentalBefore.couponId }
        });
        if (coupon && coupon.usedCount > 0) {
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { decrement: 1 } }
          });
        }
      } catch (err) {
        console.error("Failed to decrement coupon usedCount on cancellation:", err);
      }
    }

    // Generate real-time DB notifications for the customer/renter
    try {
      const { createAndDeliverNotification } = await import('../../lib/notification.js')
      if (status === "active" || status === "confirmed") {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: "Booking Confirmed! 🎉",
          message: `Your booking request for "${updatedRental.product.title}" has been successfully confirmed.`,
          type: "booking",
          url: `/journal`,
        })
      } else if (status === "cancelled" || status === "rejected") {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: "Booking Rejected ❌",
          message: `Your booking request for "${updatedRental.product.title}" was rejected by the owner.`,
          type: "alert",
          url: `/journal`,
        })
      } else if (status === "completed" || status === "returned") {
        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: "Rental Completed! 🎉",
          message: `Your rental period for "${updatedRental.product.title}" has ended. Please leave a review!`,
          type: "booking",
          url: `/journal`,
        })
      }
    } catch (err) {
      console.error("Failed to deliver notification for renter:", err)
    }

    // Send email alert to renter if preference is enabled
    try {
      if (updatedRental.renter && updatedRental.renter.bookingAlerts !== false) {
        const { sendBookingAlertEmail } = await import('../../lib/mail.js');
        let title = "";
        let message = "";
        let type = "booking_status";

        if (status === "active" || status === "confirmed") {
          title = "Booking Confirmed! 🎉";
          message = `Your booking request for "${updatedRental.product.title}" has been successfully confirmed.`;
        } else if (status === "cancelled" || status === "rejected") {
          title = "Booking Rejected ❌";
          message = `Your booking request for "${updatedRental.product.title}" was rejected by the owner.`;
        } else if (status === "completed" || status === "returned") {
          title = "Rental Completed! 🎉";
          message = `Your rental period for "${updatedRental.product.title}" has ended. Please leave a review!`;
          type = "booking_completed";
        }

        if (title && message) {
          await sendBookingAlertEmail({
            email: updatedRental.renter.email,
            name: updatedRental.renter.name || "Customer",
            title,
            message,
            type,
          });
        }
      }
    } catch (err) {
      console.error("Failed to send booking alert email to renter:", err);
    }

    return updatedRental;
  }
}

export const rentalService = new RentalService();
