import { Worker } from 'bullmq'
import { bullMQConnection } from '../../config/bullmq.js'
import { cloudinaryService } from '../../features/upload/cloudinary.service.js'
import { prisma } from '../../config/prisma.js'
import sharp from 'sharp'
import { QUEUE_NAMES, JOB_NAMES } from '../../constants/queue-keys.js'

// Helper function to download an image from a URL as a buffer
async function downloadImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download image from ${url}: ${response.statusText}`,
    )
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export const imageWorker = new Worker(
  QUEUE_NAMES.IMAGE,
  async (job) => {
    const { name, data } = job
    console.log(`[Image Worker] Processing job: ${name} (ID: ${job.id})`)

    try {
      if (name === JOB_NAMES.IMAGE.OPTIMIZE_IMAGE) {
        const { entityId, entityType, imageUrls } = data
        if (
          !entityId ||
          !entityType ||
          !Array.isArray(imageUrls) ||
          imageUrls.length === 0
        ) {
          throw new Error('Missing parameters for optimize-image job')
        }

        console.log(
          `[Image Worker] Optimizing ${imageUrls.length} images for ${entityType} ID: ${entityId}`,
        )
        const optimizedUrls: string[] = []

        for (const imageUrl of imageUrls) {
          try {
            // 1. Download original image
            console.log(
              `[Image Worker] Downloading original image: ${imageUrl}`,
            )
            const buffer = await downloadImageAsBuffer(imageUrl)

            // 2. Process image with Sharp
            console.log(`[Image Worker] Resizing and compressing image...`)
            const optimizedBuffer = await sharp(buffer)
              .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality: 80 })
              .toBuffer()

            const base64 = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`

            // 3. Upload optimized WebP to Cloudinary
            const folder = entityType === 'product' ? 'products' : 'profiles'
            console.log(
              `[Image Worker] Uploading optimized image to Cloudinary (folder: ${folder})...`,
            )
            const uploadResult = await cloudinaryService.uploadImage(
              base64,
              folder,
            )
            optimizedUrls.push(uploadResult.url)

            // 4. Delete the original image from Cloudinary to free space
            const oldPublicId = cloudinaryService.extractPublicId(imageUrl)
            if (oldPublicId) {
              console.log(
                `[Image Worker] Deleting original high-res image: ${oldPublicId}`,
              )
              await cloudinaryService.deleteImage(oldPublicId)
            }
          } catch (err: any) {
            console.error(
              `[Image Worker] Failed to optimize image "${imageUrl}":`,
              err.message,
            )
            // Fallback: keep the original URL if optimization failed for this specific image
            optimizedUrls.push(imageUrl)
          }
        }

        // 5. Update the Database
        console.log(
          `[Image Worker] Updating database for ${entityType} ${entityId}...`,
        )
        if (entityType === 'user') {
          const newProfileUrl = optimizedUrls[0]
          await prisma.user.update({
            where: { id: entityId },
            data: { image: newProfileUrl },
          })
          console.log(
            `[Image Worker] User profile image updated successfully to: ${newProfileUrl}`,
          )
        } else if (entityType === 'product') {
          // Get current product to merge/replace images correctly
          const product = await prisma.product.findUnique({
            where: { id: entityId },
            select: { images: true },
          })

          if (product) {
            // Replace matching old URLs with new optimized ones
            const updatedImages = product.images.map((img) => {
              const matchIndex = imageUrls.indexOf(img)
              return matchIndex !== -1 ? optimizedUrls[matchIndex] : img
            })

            await prisma.product.update({
              where: { id: entityId },
              data: { images: updatedImages },
            })
            console.log(`[Image Worker] Product images updated successfully.`)
          } else {
            console.warn(
              `[Image Worker] Product not found during DB update: ${entityId}`,
            )
          }
        }
      } else {
        console.warn(`[Image Worker] Unknown job type: ${name}`)
      }
    } catch (error: any) {
      console.error(
        `❌ [Image Worker] Error executing job ${name}:`,
        error.message,
      )
      throw error
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 1, // Handle one image optimization task at a time to prevent CPU overload
  },
)

imageWorker.on('failed', (job, err) => {
  console.error(
    `❌ [Image Worker] Job ${job?.id} failed with error:`,
    err.message,
  )
})

imageWorker.on('completed', (job) => {
  console.log(`✅ [Image Worker] Job ${job.id} completed successfully`)
})
