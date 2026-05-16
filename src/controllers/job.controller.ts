import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as JobService from "../services/job.service";
import * as jobUtils from "../utils/job.utils";

export const getJobsByRecruiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobs = await JobService.getJobsByRecruiter(recruiter.id);
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const job = await JobService.createJob(recruiter.id, req.body);
    res.status(201).json({ message: "Job created successfully!", job });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = req.params.id;
    const job = await JobService.getJobById(jobId);

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobId = req.params.id;
    const job = await JobService.updateJob(jobId, recruiter.id, req.body);
    res.status(200).json({ message: "Job updated successfully!", job });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recruiter = await jobUtils.validateRecruiterProfile(req.userId!, res);
    if (!recruiter) return;

    const jobId = req.params.id;
    await JobService.deleteJob(jobId, recruiter.id);
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, location, search, page, pageSize } = req.query as Record<
      string,
      string | undefined
    >;

    const result = await JobService.getAllJobs({
      category,
      location,
      search,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    res.status(200).json({
      jobs: result.jobs,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};
