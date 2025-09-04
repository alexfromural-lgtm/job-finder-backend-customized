import { Request, Response } from "express";
import * as JobService from "../services/job.service";
import * as Recruiter from "../services/recruiter.service";

export const getJobsByRecruiter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) res.status(401).json({ error: "Unauthorized" });

    const recruiter = await Recruiter.getRecruiterProfile(userId);
    if (!recruiter) {
      throw new Error("Recruiter profile not found. Please create one first.");
    }

    const jobs = await JobService.getJobsByRecruiter(recruiter.id);

    if (!jobs) res.status(404).json({ error: "No jobs found" });

    res.status(200).json({ data: jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const jobData = req.body;

    if (!userId) res.status(401).json({ error: "Unauthorized" });

    const recruiter = await Recruiter.getRecruiterProfile(userId);

    if (!recruiter) {
      throw new Error("Recruiter profile not found. Please create one first.");
    }

    const job = await JobService.createJob(recruiter.id, jobData);

    if (!job) res.status(400).json({ error: "Job creation failed" });

    res.status(201).json({ message: "Job created successfully!", data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;

    if (!jobId) res.status(400).json({ error: "Job ID is required" });

    const job = await JobService.getJobById(jobId);

    if (!job) res.status(404).json({ error: "Job not found" });

    res.status(200).json({ data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const jobData = req.body;

    if (!jobId) res.status(400).json({ error: "Job ID is required" });

    if (!jobData) res.status(400).json({ error: "Job data is required" });

    const job = await JobService.updateJob(jobId, jobData);

    if (!job) res.status(404).json({ error: "Job not found" });

    res.status(200).json({ message: "Job updated successfully!", data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;

    if (!jobId) res.status(400).json({ error: "Job ID is required" });

    await JobService.deleteJob(jobId);

    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await JobService.getAllJobs();
    res.status(200).json({ data: jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
