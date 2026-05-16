import { Response } from "express";
import * as RecruiterService from "../services/recruiter.service";
import { AppError } from "../errors/AppError";

/**
 * Validates that a recruiter profile exists for the given user.
 */
export const validateRecruiterProfile = async (userId: string, res: Response) => {
  const recruiter = await RecruiterService.getRecruiterProfile(userId);
  if (!recruiter) {
    res.status(404).json({ error: "Recruiter profile not found. Please create one first." });
    return null;
  }
  return recruiter;
};

/**
 * Handles job controller errors with semantically correct HTTP status codes.
 * Prefers AppError.statusCode — locale-safe, no message text parsing.
 * Falls back to text-matching for uncontrolled third-party errors.
 * - 403 for authorization violations
 * - 404 for missing jobs/resources
 * - 500 for unexpected server errors
 */
export const handleGenericError = (err: any, res: Response) => {
  const msg: string = err?.message ?? "Unknown error";

  // Structured error with explicit status — locale-safe path.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: msg });
  }

  // Prisma record-not-found (P2025) — not locale-dependent.
  if ((err as any)?.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  return res.status(500).json({ error: msg });
};

