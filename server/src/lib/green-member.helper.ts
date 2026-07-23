import { prisma } from '../config/prisma.js'
import { greenMemberConfig } from '../config/green-member.config.js'

/**
 * Checks a user's eligibility for the Green Member status,
 * updates the `isGreenMember` field in the database, and returns the result.
 */
export async function syncGreenMemberStatus(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            products: true,
            rentals: true,
          },
        },
      },
    })

    if (!user) return false

    let eligible = true

    if (greenMemberConfig.requireVerified && !user.emailVerified) {
      eligible = false
    }
    if (greenMemberConfig.requirePhone && !user.phone) {
      eligible = false
    }
    if (greenMemberConfig.requireLocation && !user.location) {
      eligible = false
    }
    if (user._count.products < greenMemberConfig.minListings) {
      eligible = false
    }
    if (user._count.rentals < greenMemberConfig.minRentals) {
      eligible = false
    }

    const currentStatus = user.isGreenMember === true
    if (eligible !== currentStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: { isGreenMember: eligible },
      })
      console.log(
        `❇️ Green Member status updated to ${eligible} for user ${user.name || userId}`,
      )
    }

    return eligible
  } catch (error) {
    console.error(
      `Error syncing Green Member status for user ${userId}:`,
      error,
    )
    return false
  }
}
