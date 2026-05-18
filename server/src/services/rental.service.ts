import { prisma } from "../config/prisma.js";

export class RentalService {
  async createRental(data: { productId: string; renterId: string; startDate: string; endDate: string; totalPrice: number; rentalFee: number; depositAmount: number; paymentMethod?: string }) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Check if product exists and get its owner
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) throw new Error("Product not found");
    if (!product.isAvailable) throw new Error("This product is currently not available for rent.");

    // Check for overlapping rentals
    const overlappingRental = await prisma.rental.findFirst({
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

    // For COD (Cash), we set status to pending initially so the owner can confirm/reject it
    const initialStatus = "pending";

    return prisma.rental.create({
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
      } as any,
      include: {
        product: true,
        renter: { select: { name: true, email: true } }
      }
    });
  }

  async getMyRentals(userId: string) {
    return prisma.rental.findMany({
      where: { renterId: userId },
      include: {
        product: { include: { category: true } },
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

    // Generate real-time DB notifications for the customer/renter
    try {
      if (status === "active" || status === "confirmed") {
        await prisma.notification.create({
          data: {
            userId: updatedRental.renterId,
            title: "Booking Confirmed! 🎉",
            message: `Your booking request for "${updatedRental.product.title}" has been successfully confirmed.`,
            type: "booking"
          }
        });
      } else if (status === "cancelled" || status === "rejected") {
        await prisma.notification.create({
          data: {
            userId: updatedRental.renterId,
            title: "Booking Rejected ❌",
            message: `Your booking request for "${updatedRental.product.title}" was rejected by the owner.`,
            type: "alert"
          }
        });
      }
    } catch (err) {
      console.error("Failed to save database notification for renter:", err);
    }

    return updatedRental;
  }
}

export const rentalService = new RentalService();
