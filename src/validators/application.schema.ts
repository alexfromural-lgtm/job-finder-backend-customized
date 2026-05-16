import { z } from "zod";

// ── Apply to Job ──────────────────────────────────────────────────────────────
export const applicationSchema = z.object({
  coverLetter: z.string().max(2000, "Cover letter must be at most 2000 characters").optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// ── Update Application Status (Recruiter) ─────────────────────────────────────
export const applicationStatusSchema = z.object({
  status: z.enum(["submitted", "shortlisted", "rejected", "under_review"], {
    error: "Status must be one of: submitted, shortlisted, rejected, under_review",
  }),
});

export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
