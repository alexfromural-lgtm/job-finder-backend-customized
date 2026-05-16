import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as RecruiterService from "../services/recruiter.service";
import { applicationStatusSchema } from "../validators/application.schema";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const profile = await RecruiterService.getRecruiterProfile(userId);

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const profile = await RecruiterService.updateRecruiterProfile(userId, req.body);
    res.status(200).json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const getApplicationsForJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    const data = await RecruiterService.getApplicationsForJob(userId, jobId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const applicationId = req.params.id;

    // Validate status via Zod (schema also validates, but belt-and-suspenders)
    const parsed = applicationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const application = await RecruiterService.updateApplicationStatus(
      userId,
      applicationId,
      parsed.data.status
    );
    res.status(200).json({ data: application });
  } catch (err) {
    next(err);
  }
};
