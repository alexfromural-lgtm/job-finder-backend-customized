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

