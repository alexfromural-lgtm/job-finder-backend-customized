import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as JobService from "../services/job.service";
import * as RecruiterService from "../services/recruiter.service";

export const getJobsByRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const recruiter = await RecruiterService.getRecruiterProfile(userId);
    if (!recruiter) {
      res.status(404).json({ error: "Recruiter profile not found. Please create one first." });
      return;
    }

    const jobs = await JobService.getJobsByRecruiter(recruiter.id);
    res.status(200).json({ data: jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobData = req.body;

    const recruiter = await RecruiterService.getRecruiterProfile(userId);
    if (!recruiter) {
      res.status(404).json({ error: "Recruiter profile not found. Please create one first." });
      return;
    }

    const job = await JobService.createJob(recruiter.id, jobData);
    res.status(201).json({ message: "Job created successfully!", data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const job = await JobService.getJobById(jobId);

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.status(200).json({ data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.id;
    const jobData = req.body;

    const recruiter = await RecruiterService.getRecruiterProfile(userId);
    if (!recruiter) {
      res.status(404).json({ error: "Recruiter profile not found" });
      return;
    }

    const job = await JobService.updateJob(jobId, recruiter.id, jobData);
    res.status(200).json({ message: "Job updated successfully!", data: job });
  } catch (err: any) {
    const status = err.message.includes("not authorized") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobId = req.params.id;

    const recruiter = await RecruiterService.getRecruiterProfile(userId);
    if (!recruiter) {
      res.status(404).json({ error: "Recruiter profile not found" });
      return;
    }

    await JobService.deleteJob(jobId, recruiter.id);
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (err: any) {
    const status = err.message.includes("not authorized") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { category, location, search } = req.query as {
      category?: string;
      location?: string;
      search?: string;
    };

    const jobs = await JobService.getAllJobs({ category, location, search });
    res.status(200).json({ data: jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
