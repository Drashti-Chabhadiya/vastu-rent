import { Worker } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";
import { prisma } from "../../config/prisma.js";
import { rentalService } from "../../features/rental/rental.service.js";
import { createAndDeliverNotification } from "../../lib/notification.js";
import { sendBookingAlertEmail } from "../../lib/mail.js";
import { QUEUE_NAMES, JOB_NAMES } from "../../constants/queue-keys.js";

export const rentalWorker = new Worker(
  QUEUE_NAMES.RENTAL,
  async (job) => {
    const { name, data } = job;
    console.log(`[Rental Worker] Processing job: ${name} (ID: ${job.id})`);

    try {
      if (name === JOB_NAMES.RENTAL.AUTO_EXPIRY) {
        const now = new Date();

        // 1. Auto-cancel pending rentals whose start date has passed
        const expiredPendingRentals = await prisma.rental.findMany({
          where: {
            status: "pending",
            startDate: { lt: now },
          },
          include: {
            product: true,
            renter: true,
          },
        });

        console.log(`[Rental Worker] Found ${expiredPendingRentals.length} expired pending bookings to cancel.`);

        for (const rental of expiredPendingRentals) {
          try {
            await rentalService.updateRentalStatus(rental.id, "cancelled", "failed");
            console.log(`[Rental Worker] Cancelled expired booking ${rental.id} successfully.`);

            // Notify Renter
            await createAndDeliverNotification({
              userId: rental.renterId,
              title: "Booking Expired ⏰",
              message: `Your booking request for "${rental.product.title}" has expired because the start date passed without approval.`,
              type: "alert",
              url: `/account/bookings`,
            });
          } catch (err: any) {
            console.error(`[Rental Worker] Failed to expire booking ${rental.id}:`, err.message);
          }
        }
      } else if (name === JOB_NAMES.RENTAL.SEND_REMINDERS) {
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // 1. Remind renters about bookings starting tomorrow
        const startingTomorrow = await prisma.rental.findMany({
          where: {
            status: "confirmed",
            startDate: {
              gte: oneDayFromNow,
              lte: twoDaysFromNow,
            },
          },
          include: {
            product: true,
            renter: true,
          },
        });

        console.log(`[Rental Worker] Found ${startingTomorrow.length} rentals starting tomorrow.`);

        for (const rental of startingTomorrow) {
          try {
            await createAndDeliverNotification({
              userId: rental.renterId,
              title: "Rental Starting Tomorrow! 🔑",
              message: `Get ready! Your rental period for "${rental.product.title}" starts tomorrow.`,
              type: "booking",
              url: `/account/bookings`,
            });

            if (rental.renter.bookingAlerts !== false) {
              await sendBookingAlertEmail({
                email: rental.renter.email,
                name: rental.renter.name || "Customer",
                title: "Rental Starting Tomorrow! 🔑",
                message: `This is a reminder that your rental for "${rental.product.title}" begins tomorrow. Please coordinate with the lister to pick up the item.`,
                type: "booking_status",
              });
            }
          } catch (err: any) {
            console.error(`[Rental Worker] Failed to send start reminder for rental ${rental.id}:`, err.message);
          }
        }

        // 2. Remind renters about rentals ending tomorrow
        const endingTomorrow = await prisma.rental.findMany({
          where: {
            status: "picked_up",
            endDate: {
              gte: oneDayFromNow,
              lte: twoDaysFromNow,
            },
          },
          include: {
            product: true,
            renter: true,
          },
        });

        console.log(`[Rental Worker] Found ${endingTomorrow.length} rentals ending tomorrow.`);

        for (const rental of endingTomorrow) {
          try {
            await createAndDeliverNotification({
              userId: rental.renterId,
              title: "Rental Ending Tomorrow! 📦",
              message: `Your rental period for "${rental.product.title}" ends tomorrow. Please coordinate return.`,
              type: "booking",
              url: `/account/bookings`,
            });

            if (rental.renter.bookingAlerts !== false) {
              await sendBookingAlertEmail({
                email: rental.renter.email,
                name: rental.renter.name || "Customer",
                title: "Rental Ending Tomorrow! 📦",
                message: `This is a friendly reminder that your rental for "${rental.product.title}" is due tomorrow. Please prepare to return it and retrieve the Return OTP from your dashboard.`,
                type: "booking_status",
              });
            }
          } catch (err: any) {
            console.error(`[Rental Worker] Failed to send return reminder for rental ${rental.id}:`, err.message);
          }
        }

        // 3. Remind listers of pending requests older than 12 hours
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const oldPendingRentals = await prisma.rental.findMany({
          where: {
            status: "pending",
            createdAt: { lt: twelveHoursAgo },
          },
          include: {
            product: {
              include: {
                user: true,
              },
            },
            renter: true,
          },
        });

        console.log(`[Rental Worker] Found ${oldPendingRentals.length} pending bookings awaiting approval > 12 hours.`);

        for (const rental of oldPendingRentals) {
          try {
            const lister = rental.product.user;
            await createAndDeliverNotification({
              userId: lister.id,
              title: "Pending Booking Reminder ⏳",
              message: `You have a pending booking request for "${rental.product.title}" awaiting your approval.`,
              type: "booking",
              url: `/journal`,
            });

            if (lister.bookingAlerts !== false) {
              await sendBookingAlertEmail({
                email: lister.email,
                name: lister.name || "Host",
                title: "Pending Booking Reminder ⏳",
                message: `Please review the pending booking request for "${rental.product.title}" from ${rental.renter.name || "a customer"}. Accept or reject the booking via your dashboard.`,
                type: "booking_request",
              });
            }
          } catch (err: any) {
            console.error(`[Rental Worker] Failed to send approval reminder for booking ${rental.id}:`, err.message);
          }
        }
      } else if (name === JOB_NAMES.RENTAL.PICKUP_REMINDER) {
        const { rentalId } = data;
        if (!rentalId) {
          throw new Error("Missing rentalId for pickup-reminder job");
        }

        const rental = await prisma.rental.findUnique({
          where: { id: rentalId },
          include: {
            product: true,
            renter: true,
          },
        });

        if (!rental) {
          console.warn(`[Rental Worker] Rental ${rentalId} not found for pickup reminder.`);
          return;
        }

        // Only send reminder if status is still confirmed
        if (rental.status === "confirmed") {
          console.log(`[Rental Worker] Sending pickup reminder for rental ${rental.id} to renter ${rental.renterId}`);

          await createAndDeliverNotification({
            userId: rental.renterId,
            title: "Reminder: Pickup Tomorrow! 🔑",
            message: `Reminder: You have to pick up your product "${rental.product.title}" tomorrow.`,
            type: "booking",
            url: `/account/bookings`,
          });

          if (rental.renter.bookingAlerts !== false) {
            await sendBookingAlertEmail({
              email: rental.renter.email,
              name: rental.renter.name || "Customer",
              title: "Reminder: Pickup Tomorrow! 🔑",
              message: `This is a reminder that you are scheduled to pick up "${rental.product.title}" tomorrow. Please coordinate with the host for pickup details.`,
              type: "booking_status",
            });
          }
        } else {
          console.log(`[Rental Worker] Rental ${rentalId} status is ${rental.status} (not 'confirmed'). Skipping pickup reminder.`);
        }
      } else if (name === JOB_NAMES.RENTAL.RETURN_REMINDER) {
        const { rentalId } = data;
        if (!rentalId) {
          throw new Error("Missing rentalId for return-reminder job");
        }

        const rental = await prisma.rental.findUnique({
          where: { id: rentalId },
          include: {
            product: true,
            renter: true,
          },
        });

        if (!rental) {
          console.warn(`[Rental Worker] Rental ${rentalId} not found for return reminder.`);
          return;
        }

        // Only send reminder if status is still picked_up
        if (rental.status === "picked_up") {
          console.log(`[Rental Worker] Sending return reminder for rental ${rental.id} to renter ${rental.renterId}`);

          await createAndDeliverNotification({
            userId: rental.renterId,
            title: "Reminder: Rental Ending Soon! 📦",
            message: `Reminder: Your rental period is ending soon. Please return the product "${rental.product.title}" and provide the OTP for the return process.`,
            type: "booking",
            url: `/account/bookings`,
          });

          if (rental.renter.bookingAlerts !== false) {
            await sendBookingAlertEmail({
              email: rental.renter.email,
              name: rental.renter.name || "Customer",
              title: "Reminder: Rental Ending Soon! 📦",
              message: `This is a reminder that your rental period for "${rental.product.title}" is ending soon. Please coordinate with the host to return the product and complete the verification using your Return OTP.`,
              type: "booking_status",
            });
          }
        } else {
          console.log(`[Rental Worker] Rental ${rentalId} status is ${rental.status} (not 'picked_up'). Skipping return reminder.`);
        }
      } else {
        console.warn(`[Rental Worker] Unknown job type: ${name}`);
      }
    } catch (error: any) {
      console.error(`❌ [Rental Worker] Error executing job ${name}:`, error.message);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 1,
  }
);

rentalWorker.on("failed", (job, err) => {
  console.error(`❌ [Rental Worker] Job ${job?.id} failed with error:`, err.message);
});

rentalWorker.on("completed", (job) => {
  console.log(`✅ [Rental Worker] Job ${job.id} completed successfully`);
});
