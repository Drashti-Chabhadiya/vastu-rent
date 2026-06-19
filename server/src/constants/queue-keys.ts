export const QUEUE_NAMES = {
  PAYMENT: "paymentQueue",
  NOTIFICATION: "notificationQueue",
  IMAGE: "imageQueue",
  RENTAL: "rentalQueue",
  CHAT: "chatQueue",
} as const;

export const JOB_NAMES = {
  PAYMENT: {
    VERIFY_PAYMENT: "verify-payment",
    GENERATE_INVOICE: "generate-invoice",
  },
  NOTIFICATION: {
    PUSH_NOTIFICATION: "push-notification",
    SEND_EMAIL: "send-email",
  },
  IMAGE: {
    OPTIMIZE_IMAGE: "optimize-image",
  },
  RENTAL: {
    AUTO_EXPIRY: "auto-expiry",
    SEND_REMINDERS: "send-reminders",
    PICKUP_REMINDER: "pickup-reminder",
    RETURN_REMINDER: "return-reminder",
  },
  CHAT: {
    UNREAD_COUNT: "unread-count",
    MESSAGE_NOTIFICATION: "message-notification",
  },
} as const;
