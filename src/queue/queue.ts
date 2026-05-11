import Bull from "bull";
import { QueuePayload } from "./types";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Shared Bull queue for all database write operations that need
 * to be processed asynchronously under high concurrency.
 */
const dbWriteQueue = new Bull<QueuePayload>("db-write-queue", {
  redis: REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 500,
    },
    removeOnComplete: false, // keep completed jobs so clients can poll status
    removeOnFail: false,     // keep failed jobs for debugging
  },
});

dbWriteQueue.on("error", (err) => {
  console.error("[Queue] Bull queue error:", err.message);
});

export default dbWriteQueue;
