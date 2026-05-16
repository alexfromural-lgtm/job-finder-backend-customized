import { Response } from "express";
import * as RecruiterService from "../services/recruiter.service";

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
 * - 403 for authorization violations
 * - 404 for missing jobs/resources
 * - 500 for unexpected server errors
 */
export const handleGenericError = (err: any, res: Response) => {
  const msg: string = err?.message ?? "Unknown error";

  if (msg.includes("not authorized") || msg.includes("not authorized to")) {
    return res.status(403).json({ error: msg });
  }
  if (msg.includes("not found") || msg.includes("Not found")) {
    return res.status(404).json({ error: msg });
  }

  return res.status(500).json({ error: msg });
};

