/**
 * Discriminated union of all queued write operation payloads.
 * Only high-traffic jobseeker write operations are queued.
 */

export interface ApplyToJobPayload {
  type: "apply-to-job";
  userId: string;
  jobId: string;
  coverLetter?: string;
}

export interface SaveJobPayload {
  type: "save-job";
  userId: string;
  jobId: string;
}

export type QueuePayload = ApplyToJobPayload | SaveJobPayload;
