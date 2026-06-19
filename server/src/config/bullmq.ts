import { ConnectionOptions } from "bullmq";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const getBullMQConnection = (): ConnectionOptions => {
  try {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || "6379"),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db: parsed.pathname && parsed.pathname !== "/" ? parseInt(parsed.pathname.substring(1)) : 0,
      // If using SSL/TLS (commonly rediss:// protocol)
      tls: parsed.protocol === "rediss:" ? {} : undefined,
      maxRetriesPerRequest: null, // Critical for BullMQ
    };
  } catch (error) {
    console.error("❌ Failed to parse REDIS_URL for BullMQ connection, using fallback host:", error);
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const bullMQConnection = getBullMQConnection();
