import { Router, Request, Response } from "express";
import dbWriteQueue from "../queue/queue";

const router = Router();

/**
 * GET /api/queue/job/:jobId
 *
 * Allows the client to poll the status of a queued write operation.
 * Returns job status and result (on completion) or failure reason.
 *
 * Statuses: waiting | active | completed | failed | delayed | paused
 */
router.get("/job/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = await dbWriteQueue.getJob(jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const state = await job.getState();
  const response: Record<string, any> = {
    id: job.id,
    type: job.data.type,
    status: state,
    attemptsMade: job.attemptsMade,
    createdAt: new Date(job.timestamp).toISOString(),
  };

  if (state === "completed") {
    response.result = job.returnvalue;
  }

  if (state === "failed") {
    response.failedReason = job.failedReason;
  }

  res.status(200).json(response);
});

export default router;
