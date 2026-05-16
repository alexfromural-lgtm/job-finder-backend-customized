import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as JobService from "../services/job.service";
import * as jobUtils from "../utils/job.utils";
import { handleGenericError } from "../utils/job.utils";

export const getJobsByRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobs = await JobService.getJobsByRecruiter(recruiter.id);
    res.status(200).json({ data: jobs });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobData = req.body;
    const job = await JobService.createJob(recruiter.id, jobData);
    res.status(201).json({ message: "Job created successfully!", data: job });
  } catch (err: any) {
    handleGenericError(err, res);
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
    handleGenericError(err, res);
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobId = req.params.id;
    const jobData = req.body;
    const job = await JobService.updateJob(jobId, recruiter.id, jobData);
    res.status(200).json({ message: "Job updated successfully!", data: job });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobId = req.params.id;
    await JobService.deleteJob(jobId, recruiter.id);
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { category, location, search, page, pageSize } = req.query as Record<string, string | undefined>;

    const result = await JobService.getAllJobs({
      category,
      location,
      search,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    res.status(200).json({
      data: result.jobs,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    handleGenericError(err, res);
  }
};
