import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as JobseekerService from "../services/jobseeker.service";
import { handleAuthAwareError } from "../utils/auth.utils";
import { handleGenericError } from "../utils/job.utils";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await JobseekerService.getJobSeekerProfile(userId);

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await JobseekerService.updateJobSeekerProfile(userId, req.body);
    res.status(200).json({ profile });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;
    const { coverLetter } = req.body;

    const application = await JobseekerService.applyToJob(userId, jobId, coverLetter);
    res.status(201).json({ application });
  } catch (err: any) {
    handleAuthAwareError(err, res, { keyword: "already applied", keywordStatus: 409 });
  }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = await JobseekerService.getApplications(userId);
    res.status(200).json({ data });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const applicationId = req.params.id;

    await JobseekerService.withdrawApplication(userId, applicationId);
    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err: any) {
    handleAuthAwareError(err, res);
  }
};

export const saveJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    const savedJob = await JobseekerService.saveJob(userId, jobId);
    res.status(201).json({ savedJob });
  } catch (err: any) {
    handleAuthAwareError(err, res);
  }
};

export const getSavedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = await JobseekerService.getSavedJobs(userId);
    res.status(200).json({ data });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const unsaveJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    await JobseekerService.unsaveJob(userId, jobId);
    res.status(200).json({ message: "Job removed from saved list" });
  } catch (err: any) {
    handleAuthAwareError(err, res, { keyword: "not found", keywordStatus: 404 });
  }
};
