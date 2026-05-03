import { Response } from "express";
import { ApplicationStatus } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import * as RecruiterService from "../services/recruiter.service";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await RecruiterService.getRecruiterProfile(userId);

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await RecruiterService.updateRecruiterProfile(userId, req.body);
    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplicationsForJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.jobId;

    const data = await RecruiterService.getApplicationsForJob(userId, jobId);
    res.status(200).json({ data });
  } catch (err: any) {
    const status = err.message.includes("not authorized") ? 403 : 404;
    res.status(status).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const applicationId = req.params.id;
    const { status } = req.body as { status: ApplicationStatus };

    const validStatuses = ["submitted", "shortlisted", "rejected", "under_review"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const application = await RecruiterService.updateApplicationStatus(userId, applicationId, status);
    res.status(200).json({ application });
  } catch (err: any) {
    const status = err.message.includes("not authorized") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
};
