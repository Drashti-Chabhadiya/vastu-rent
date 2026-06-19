import { prisma } from "../../config/prisma.js";
import { cloudinaryService } from "../upload/cloudinary.service.js";
import { sendEmailNotificationsConfirmationEmail, sendMarketingWelcomeEmail } from "../../lib/mail.js";
import { syncGreenMemberStatus } from "../../lib/green-member.helper.js";

export class UserService {
  async getRecentUsers() {
    return prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    });
  }

  async getAllUsers(filters: { search?: string; role?: any; status?: string }) {
    const { search, role, status } = filters;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (status === 'banned') where.banned = true;
    if (status === 'active') where.banned = false;

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        image: true,
        banReason: true,
        showOnline: true,
        lastActive: true,
      },
    });
  }

  async banUser(id: string, banned: boolean, reason?: string) {
    return prisma.user.update({
      where: { id },
      data: {
        banned: !!banned,
        banReason: reason || null,
      },
    });
  }

  async updateUserRole(id: string, role: any) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.image) {
      const publicId = cloudinaryService.extractPublicId(user.image);
      if (publicId) {
        await cloudinaryService.deleteImage(publicId, id);
      }
    }
    return prisma.user.delete({ where: { id } });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async getPublicProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            category: true,
            reviews: true,
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!user) return null;

    // Calculate average rating across all products
    let totalRating = 0;
    let reviewCount = 0;
    user.products.forEach((p: any) => {
      p.reviews.forEach((r: any) => {
        totalRating += r.rating;
        reviewCount++;
      });
    });

    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "5.0";

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      listings: user.products,
      listingsCount: user._count.products,
      averageRating,
      reviewCount,
      emailVerified: user.emailVerified,
      location: user.location,
      language: user.language,
      phone: user.phone,
      showProfile: user.showProfile,
      showOnline: user.showOnline,
      lastActive: user.lastActive,
      isGreenMember: user.isGreenMember,
      bio: user.bio,
    };
  }

  // Update user settings in the database (synced with Prisma client)
  async updateUserSettings(id: string, data: {
    upiId?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolder?: string;
    bookingAlerts?: boolean;
    settlementAlerts?: boolean;
    marketingAlerts?: boolean;
    gender?: string;
    location?: string;
    phone?: string;
    language?: string;
    dob?: string;
    currency?: string;
    twoFactorEnabled?: boolean;
    showProfile?: boolean;
    showOnline?: boolean;
    allowData?: boolean;
    bio?: string;
  }) {
    const userBefore = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, bookingAlerts: true, marketingAlerts: true }
    });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        upiId: data.upiId !== undefined ? data.upiId : undefined,
        bankName: data.bankName !== undefined ? data.bankName : undefined,
        accountNumber: data.accountNumber !== undefined ? data.accountNumber : undefined,
        ifscCode: data.ifscCode !== undefined ? data.ifscCode : undefined,
        accountHolder: data.accountHolder !== undefined ? data.accountHolder : undefined,
        bookingAlerts: data.bookingAlerts !== undefined ? data.bookingAlerts : undefined,
        settlementAlerts: data.settlementAlerts !== undefined ? data.settlementAlerts : undefined,
        marketingAlerts: data.marketingAlerts !== undefined ? data.marketingAlerts : undefined,
        gender: data.gender !== undefined ? data.gender : undefined,
        location: data.location !== undefined ? data.location : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        language: data.language !== undefined ? data.language : undefined,
        dob: data.dob !== undefined ? data.dob : undefined,
        currency: data.currency !== undefined ? data.currency : undefined,
        twoFactorEnabled: data.twoFactorEnabled !== undefined ? data.twoFactorEnabled : undefined,
        showProfile: data.showProfile !== undefined ? data.showProfile : undefined,
        showOnline: data.showOnline !== undefined ? data.showOnline : undefined,
        allowData: data.allowData !== undefined ? data.allowData : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
      }
    });

    if (userBefore) {
      const name = updatedUser.name || "User";
      const email = updatedUser.email;

      // Check if Email Notifications were toggled from OFF to ON (accepts false/nullish values)
      if (data.bookingAlerts === true && userBefore.bookingAlerts !== true) {
        try {
          await sendEmailNotificationsConfirmationEmail({ email, name });
        } catch (err) {
          console.error("Failed to send email activation confirmation:", err);
        }
      }

      // Check if Marketing Emails were toggled from OFF to ON (accepts false/nullish values)
      if (data.marketingAlerts === true && userBefore.marketingAlerts !== true) {
        try {
          await sendMarketingWelcomeEmail({ email, name });
        } catch (err) {
          console.error("Failed to send marketing welcome email:", err);
        }
      }
    }

    // Sync Green Member status when user preferences or settings change
    try {
      await syncGreenMemberStatus(id);
    } catch (err) {
      console.error("Failed to sync Green Member status on settings update:", err);
    }

    return updatedUser;
  }

  async getCloudinaryConfig(_userId: string) {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      uploadPreset: "",
      hasSecret: !!process.env.CLOUDINARY_API_SECRET,
    };
  }

  async saveCloudinaryConfig(_userId: string, _data: { cloudName: string; apiKey: string; apiSecret?: string; uploadPreset?: string }) {
    throw new Error("Cloudinary configuration is managed globally via environment variables (.env) and cannot be configured per user.");
  }

  async getRecentSearches(userId: string) {
    return prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async saveRecentSearch(userId: string, query: string) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Use upsert to create or update the search query's timestamp
    await prisma.recentSearch.upsert({
      where: {
        userId_query: {
          userId,
          query: trimmed,
        },
      },
      update: {
        createdAt: new Date(),
      },
      create: {
        userId,
        query: trimmed,
      },
    });

    // Enforce limit of 10 recent searches per user by deleting the oldest ones
    const searches = await prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (searches.length > 10) {
      const idsToDelete = searches.slice(10).map((s) => s.id);
      await prisma.recentSearch.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    return this.getRecentSearches(userId);
  }

  async deleteRecentSearch(userId: string, id: string) {
    return prisma.recentSearch.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  async clearRecentSearches(userId: string) {
    return prisma.recentSearch.deleteMany({
      where: { userId },
    });
  }
}

export const userService = new UserService();
