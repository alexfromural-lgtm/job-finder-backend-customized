import { Job } from "bull";
import dbWriteQueue from "./queue";
import { QueuePayload } from "./types";
import * as JobseekerService from "../services/jobseeker.service";

const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY || "5", 10);

/**
 * Central processor for all queued DB write operations.
 * Dispatches to the appropriate service based on job type.
 */
dbWriteQueue.process(CONCURRENCY, async (job: Job<QueuePayload>) => {
  const { data } = job;
  console.log(`[Worker] Processing job #${job.id} | type: ${data.type}`);

  switch (data.type) {
    case "apply-to-job": {
      const application = await JobseekerService.applyToJob(
        data.userId,
        data.jobId,
        data.coverLetter
      );
      console.log(`[Worker] Job #${job.id} (apply-to-job) completed.`);
      return application;
    }

    case "save-job": {
      const savedJob = await JobseekerService.saveJob(data.userId, data.jobId);
      console.log(`[Worker] Job #${job.id} (save-job) completed.`);
      return savedJob;
    }

    default: {
      // TypeScript exhaustive check
      const _exhaustive: never = data;
      throw new Error(`Unknown job type: ${(_exhaustive as any).type}`);
    }
  }
});

dbWriteQueue.on("completed", (job) => {
  console.log(`[Worker] ✓ Job #${job.id} (${job.data.type}) succeeded.`);
});

dbWriteQueue.on("failed", (job, err) => {
  console.error(
    `[Worker] ✗ Job #${job.id} (${job.data.type}) failed after ${job.attemptsMade} attempt(s): ${err.message}`
  );
});

console.log(`[Worker] db-write-queue worker started (concurrency: ${CONCURRENCY})`);
