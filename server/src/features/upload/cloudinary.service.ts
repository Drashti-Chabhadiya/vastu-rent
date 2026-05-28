import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "../../config/prisma.js";
import { decrypt } from "../../config/encryption.js";
import { isDashboardRole } from "../../config/roles.js";

export class CloudinaryService {
  /**
   * Get dynamic Cloudinary credentials for a user
   */
  async getCredentialsForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cloudinaryConfig: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const role = user.role;
    if (isDashboardRole(role)) {
      if (!user.cloudinaryConfig) {
        throw new Error("Cloudinary credentials are not configured. Please set them up in your dashboard settings before uploading.");
      }
      
      const decryptedSecret = decrypt(user.cloudinaryConfig.apiSecret);
      return {
        cloud_name: user.cloudinaryConfig.cloudName,
        api_key: user.cloudinaryConfig.apiKey,
        api_secret: decryptedSecret,
      };
    }

    // Fallback for regular users (e.g. uploading profile pictures) if they don't have dashboard roles,
    // we can use the global environment credentials if available.
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      };
    }

    throw new Error("Cloudinary storage is not configured for this application.");
  }

  /**
   * Upload an image to Cloudinary
   * @param file The file buffer or base64 string
   * @param folder The folder to store the image in (e.g., 'products', 'profiles')
   * @param userId The ID of the user uploading the image (for dynamic credentials)
   */
  async uploadImage(file: string, folder: string, userId?: string): Promise<{ url: string; publicId: string }> {
    try {
      let options: any = {
        folder: `vastu-rent/${folder}`,
        resource_type: 'auto',
      };

      if (userId) {
        const creds = await this.getCredentialsForUser(userId);
        options = {
          ...options,
          ...creds
        };
      }

      const result = await cloudinary.uploader.upload(file, options);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      throw new Error(error.message || 'Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId The public ID of the image to delete
   * @param userId The ID of the user who owns the image
   */
  async deleteImage(publicId: string, userId?: string): Promise<void> {
    try {
      if (!publicId) return;
      
      let options: any = {};
      if (userId) {
        try {
          const creds = await this.getCredentialsForUser(userId);
          options = { ...creds };
        } catch {
          // If custom credentials fail, fall back to global config
        }
      }

      const result = await cloudinary.uploader.destroy(publicId, options);
      
      if (result.result !== 'ok' && result.result !== 'not found') {
        console.warn('Cloudinary Delete Warning:', result);
      }
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      // We don't throw here to avoid breaking the main application flow
    }
  }

  /**
   * Extract Public ID from a Cloudinary URL
   * Useful for deleting images when you only have the URL stored
   */
  extractPublicId(url: string): string | null {
    try {
      if (!url || !url.includes('cloudinary.com')) return null;
      
      // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[ext]
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;
      
      // Public ID is everything after the version (v1234567) or the upload index if no version
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.split('.')[0];
      
      return publicId;
    } catch (error) {
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
