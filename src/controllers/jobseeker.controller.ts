import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as JobseekerService from "../services/jobseeker.service";
import dbWriteQueue from "../queue/queue";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const profile = await JobseekerService.getJobSeekerProfile(userId);

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
    const profile = await JobseekerService.updateJobSeekerProfile(userId, req.body);
    res.status(200).json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const applyToJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;
    const { coverLetter } = req.body;

    const job = await dbWriteQueue.add({ type: "apply-to-job", userId, jobId, coverLetter });
    res.status(202).json({ data: { queueJobId: job.id, status: "queued" } });
  } catch (err) {
    next(err);
  }
};

export const getApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const data = await JobseekerService.getApplications(userId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

export const withdrawApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const applicationId = req.params.id;

    await JobseekerService.withdrawApplication(userId, applicationId);
    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err) {
    next(err);
  }
};

export const saveJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    const job = await dbWriteQueue.add({ type: "save-job", userId, jobId });
    res.status(202).json({ data: { queueJobId: job.id, status: "queued" } });
  } catch (err) {
    next(err);
  }
};

export const getSavedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const data = await JobseekerService.getSavedJobs(userId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

export const unsaveJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    await JobseekerService.unsaveJob(userId, jobId);
    res.status(200).json({ message: "Job removed from saved list" });
  } catch (err) {
    next(err);
  }
};
