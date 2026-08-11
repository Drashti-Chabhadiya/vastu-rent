import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary globally using environment variables from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export class CloudinaryService {
  /**
   * Get dynamic Cloudinary credentials (now returns global config to maintain signature compatibility)
   */
  async getCredentialsForUser(_userId: string) {
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      }
    }

    throw new Error(
      'Cloudinary storage is not configured for this application.',
    )
  }

  /**
   * Upload an image to Cloudinary using global configuration
   * @param file The file buffer or base64 string
   * @param folder The folder to store the image in (e.g., 'products', 'profiles')
   * @param _userId The ID of the user uploading the image (ignored, kept for signature compatibility)
   * @param hideFaces Whether to blur out faces in the image
   */
  async uploadImage(
    file: string,
    folder: string,
    _userId?: string,
  ): Promise<{ url: string; publicId: string; faces: any[] }> {
    try {
      const options: any = {
        folder: `vastu-rent/${folder}`,
        resource_type: 'auto' as const,
        faces: true,
      }

      const result = await cloudinary.uploader.upload(file, options)

      return {
        url: result.secure_url,
        publicId: result.public_id,
        faces: result.faces || [],
      }
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error)
      throw new Error(error.message || 'Failed to upload image to Cloudinary')
    }
  }

  /**
   * Delete an image from Cloudinary using global configuration
   * @param publicId The public ID of the image to delete
   * @param _userId The ID of the user who owns the image (ignored, kept for signature compatibility)
   */
  async deleteImage(publicId: string, _userId?: string): Promise<void> {
    try {
      if (!publicId) return

      const result = await cloudinary.uploader.destroy(publicId)

      if (result.result !== 'ok' && result.result !== 'not found') {
        console.warn('Cloudinary Delete Warning:', result)
      }
    } catch (error) {
      console.error('Cloudinary Delete Error:', error)
    }
  }

  /**
   * Extract Public ID from a Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      if (!url || !url.includes('cloudinary.com')) return null

      const parts = url.split('/')
      const uploadIndex = parts.findIndex((part) => part === 'upload')
      if (uploadIndex === -1) return null

      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/')
      const publicId = publicIdWithExt.split('.')[0]

      return publicId
    } catch {
      return null
    }
  }
}

export const cloudinaryService = new CloudinaryService()
