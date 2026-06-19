import { Worker } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";
import { paymentService } from "../../features/payment/payment.service.js";
import { prisma } from "../../config/prisma.js";
import { sendBookingAlertEmail } from "../../lib/mail.js";
import { paymentQueue } from "../queues.js";
import { QUEUE_NAMES, JOB_NAMES } from "../../constants/queue-keys.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const paymentWorker = new Worker(
  QUEUE_NAMES.PAYMENT,
  async (job) => {
    const { name, data } = job;
    console.log(`[Payment Worker] Processing job: ${name} (ID: ${job.id})`);

    try {
      if (name === JOB_NAMES.PAYMENT.VERIFY_PAYMENT) {
        const { userId, sessionId, rentalId } = data;
        if (!userId || !sessionId || !rentalId) {
          throw new Error("Missing parameters for verify-payment job");
        }

        const result = await paymentService.verifyBookingSession(userId, sessionId, rentalId);
        console.log(`[Payment Worker] Verification result for rental ${rentalId}:`, result);

        if (result.success && result.rental?.paymentStatus === "paid") {
          // Add generate-invoice job to queue
          await paymentQueue.add(JOB_NAMES.PAYMENT.GENERATE_INVOICE, { rentalId });
          console.log(`[Payment Worker] Enqueued invoice generation for rental ${rentalId}`);
        }
      } else if (name === JOB_NAMES.PAYMENT.GENERATE_INVOICE) {
        const { rentalId } = data;
        if (!rentalId) {
          throw new Error("Missing rentalId for generate-invoice job");
        }

        // Fetch complete rental details
        const rental = await prisma.rental.findUnique({
          where: { id: rentalId },
          include: {
            product: true,
            renter: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        if (!rental) {
          throw new Error(`Rental not found for invoice generation: ${rentalId}`);
        }

        // Create HTML/Text content for the invoice
        const formattedDate = new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const invoiceText = `
======================================================================
                     VASTURENT RENTAL RECEIPT
======================================================================
Invoice Date    : ${formattedDate}
Booking ID      : ${rental.id}
Transaction ID  : ${rental.transactionId || "N/A"}
Payment Status  : ${rental.paymentStatus.toUpperCase()}
Booking Status  : ${rental.status.toUpperCase()}

----------------------------------------------------------------------
RENTER INFO
----------------------------------------------------------------------
Name  : ${rental.renter.name || "Customer"}
Email : ${rental.renter.email}

----------------------------------------------------------------------
PRODUCT INFO
----------------------------------------------------------------------
Product Title   : ${rental.product.title}
Base Rent/Day   : ₹${rental.product.price}
Security Deposit: ₹${rental.product.securityDeposit}

----------------------------------------------------------------------
DURATION
----------------------------------------------------------------------
Start Date      : ${rental.startDate.toLocaleDateString("en-IN")}
End Date        : ${rental.endDate.toLocaleDateString("en-IN")}

----------------------------------------------------------------------
PRICING SUMMARY
----------------------------------------------------------------------
Rental Charges  : ₹${rental.rentalFee}
Security Deposit: ₹${rental.depositAmount}
Total Paid      : ₹${rental.totalPrice}

======================================================================
Thank you for renting with VastuRent!
======================================================================
`;

        // Ensure directories exist in server root
        const serverRoot = path.join(__dirname, "../../../");
        const publicDir = path.join(serverRoot, "public");
        const invoicesDir = path.join(publicDir, "invoices");

        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const invoicePath = path.join(invoicesDir, `invoice_${rentalId}.txt`);
        fs.writeFileSync(invoicePath, invoiceText.trim());
        console.log(`[Payment Worker] Invoice written to ${invoicePath}`);

        // Email invoice to the renter using existing mail setup
        await sendBookingAlertEmail({
          email: rental.renter.email,
          name: rental.renter.name || "Customer",
          title: "VastuRent Booking Invoice 🧾",
          message: `Your payment was confirmed. Here is your receipt/invoice for rental order #${rental.id}:\n\n${invoiceText}`,
          type: "booking_status",
        });

        console.log(`[Payment Worker] Invoice email successfully sent to ${rental.renter.email}`);
      } else {
        console.warn(`[Payment Worker] Unknown job type: ${name}`);
      }
    } catch (error: any) {
      console.error(`❌ [Payment Worker] Error executing job ${name}:`, error.message);
      throw error; // Re-throw to let BullMQ mark job as failed
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 2, // Allow up to 2 jobs in parallel
  }
);

paymentWorker.on("failed", (job, err) => {
  console.error(`❌ [Payment Worker] Job ${job?.id} failed with error:`, err.message);
});

paymentWorker.on("completed", (job) => {
  console.log(`✅ [Payment Worker] Job ${job.id} completed successfully`);
});
