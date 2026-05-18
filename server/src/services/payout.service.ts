import { prisma } from "../config/prisma.js";

export class PayoutService {
  async getEarningsDashboard(ownerId: string) {
    // 1. Get all rentals of listings owned by this owner
    const orders = await prisma.rental.findMany({
      where: {
        product: { ownerId: ownerId },
        status: { in: ["confirmed", "active", "completed"] }
      },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Get all payout requests by this owner
    const payouts = await prisma.payout.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" }
    });

    // 3. Perform calculations
    const totalEarnings = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    
    // Monthly Earnings Calculation (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEarnings = orders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const platformCommissionRate = 0.10; // 10%
    const platformCommission = totalEarnings * platformCommissionRate;
    const netEarnings = totalEarnings - platformCommission;

    const completedPayoutsTotal = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayoutsTotal = payouts
      .filter(p => p.status === "pending" || p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);

    // Withdrawable Balance = Net Earnings - (Pending Payouts + Completed Payouts)
    const withdrawableBalance = Math.max(0, netEarnings - (pendingPayoutsTotal + completedPayoutsTotal));

    // 4. Group earnings by product
    const productStatsMap: Record<string, { id: string; title: string; image: string; totalEarned: number; bookingCount: number }> = {};
    orders.forEach(order => {
      const prod = order.product;
      if (!prod) return;

      if (!productStatsMap[prod.id]) {
        productStatsMap[prod.id] = {
          id: prod.id,
          title: prod.title,
          image: prod.images?.[0] || "",
          totalEarned: 0,
          bookingCount: 0
        };
      }
      productStatsMap[prod.id].totalEarned += order.totalPrice;
      productStatsMap[prod.id].bookingCount += 1;
    });

    const productBreakdown = Object.values(productStatsMap).sort((a, b) => b.totalEarned - a.totalEarned);

    return {
      stats: {
        totalEarnings,
        monthlyEarnings,
        platformCommission,
        netEarnings,
        withdrawableBalance,
        pendingPayouts: pendingPayoutsTotal,
        completedPayouts: completedPayoutsTotal
      },
      payoutRequests: payouts,
      productBreakdown,
      recentTransactions: orders.map(o => ({
        id: o.id,
        createdAt: o.createdAt,
        totalPrice: o.totalPrice,
        status: o.status,
        product: {
          title: o.product?.title,
          image: o.product?.images?.[0]
        }
      }))
    };
  }

  async createPayoutRequest(ownerId: string, amount: number) {
    if (amount <= 0) {
      throw new Error("Payout amount must be greater than zero");
    }

    // Retrieve earnings stats to verify withdrawable balance
    const dashboard = await this.getEarningsDashboard(ownerId);
    if (amount > dashboard.stats.withdrawableBalance) {
      throw new Error(`Insufficient balance! Your maximum withdrawable balance is ₹${dashboard.stats.withdrawableBalance.toLocaleString()}`);
    }

    return prisma.payout.create({
      data: {
        ownerId,
        amount,
        status: "pending"
      }
    });
  }

  async getPayoutsByOwner(ownerId: string) {
    return prisma.payout.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" }
    });
  }

  async getAllPayoutRequests() {
    return prisma.payout.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async updatePayoutStatus(id: string, status: string, notes?: string) {
    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid payout status");
    }

    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: { 
        status,
        notes: notes || undefined
      },
      include: {
        owner: true
      }
    });

    // Create DB notifications for the owner regarding status change
    try {
      let title = "Payout Request Update 🔔";
      let message = `Your payout request for ₹${updatedPayout.amount.toLocaleString()} is now "${status}".`;
      let type = "info";

      if (status === "approved") {
        title = "Payout Approved! ✅";
        message = `Your payout request of ₹${updatedPayout.amount.toLocaleString()} has been approved and is being processed.`;
        type = "payment";
      } else if (status === "paid") {
        title = "Payout Sent! 💸";
        message = `Your payout of ₹${updatedPayout.amount.toLocaleString()} has been successfully transferred to your account!`;
        type = "payment";
      } else if (status === "rejected") {
        title = "Payout Rejected ❌";
        message = `Your payout request of ₹${updatedPayout.amount.toLocaleString()} was rejected. Reason: ${notes || "Contact support."}`;
        type = "alert";
      }

      await prisma.notification.create({
        data: {
          userId: updatedPayout.ownerId,
          title,
          message,
          type
        }
      });
    } catch (err) {
      console.error("Failed to generate DB notification for payout:", err);
    }

    return updatedPayout;
  }
}

export const payoutService = new PayoutService();
