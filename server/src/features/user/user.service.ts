import { prisma } from "../../config/prisma.js";

export class UserService {
  async getRecentUsers() {
    return prisma.user.findMany({
      take: 10,
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
      const { cloudinaryService } = await import("../upload/cloudinary.service.js");
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
      reviewCount
    };
  }

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
      }
    });

    if (userBefore) {
      const name = updatedUser.name || "User";
      const email = updatedUser.email;

      // Check if Email Notifications were toggled from OFF to ON (accepts false/nullish values)
      if (data.bookingAlerts === true && userBefore.bookingAlerts !== true) {
        try {
          const { sendEmailNotificationsConfirmationEmail } = await import('../../lib/mail.js');
          await sendEmailNotificationsConfirmationEmail({ email, name });
        } catch (err) {
          console.error("Failed to send email activation confirmation:", err);
        }
      }

      // Check if Marketing Emails were toggled from OFF to ON (accepts false/nullish values)
      if (data.marketingAlerts === true && userBefore.marketingAlerts !== true) {
        try {
          const { sendMarketingWelcomeEmail } = await import('../../lib/mail.js');
          await sendMarketingWelcomeEmail({ email, name });
        } catch (err) {
          console.error("Failed to send marketing welcome email:", err);
        }
      }
    }

    return updatedUser;
  }

  async getCloudinaryConfig(userId: string) {
    const config = await prisma.cloudinaryConfig.findUnique({
      where: { userId }
    });
    if (!config) return null;
    return {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      uploadPreset: config.uploadPreset,
      hasSecret: !!config.apiSecret,
    };
  }

  async saveCloudinaryConfig(userId: string, data: { cloudName: string; apiKey: string; apiSecret?: string; uploadPreset?: string }) {
    const { cloudName, apiKey, apiSecret, uploadPreset } = data;

    let encryptedSecret: string | undefined;
    if (apiSecret) {
      const { encrypt } = await import("../../config/encryption.js");
      encryptedSecret = encrypt(apiSecret);
    }

    const existing = await prisma.cloudinaryConfig.findUnique({
      where: { userId }
    });

    if (existing) {
      return prisma.cloudinaryConfig.update({
        where: { userId },
        data: {
          cloudName,
          apiKey,
          uploadPreset: uploadPreset !== undefined ? uploadPreset : null,
          ...(encryptedSecret ? { apiSecret: encryptedSecret } : {}),
        }
      });
    } else {
      if (!apiSecret) {
        throw new Error("API Secret is required for new configurations");
      }
      return prisma.cloudinaryConfig.create({
        data: {
          userId,
          cloudName,
          apiKey,
          apiSecret: encryptedSecret!,
          uploadPreset,
        }
      });
    }
  }
}

export const userService = new UserService();
