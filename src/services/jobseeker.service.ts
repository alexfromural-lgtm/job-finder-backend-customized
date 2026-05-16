import prisma from "../prisma/client";
import { AppError } from "../errors/AppError";

export const getJobSeekerProfile = async (userId: string) => {
  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          roles: true,
        },
      },
    },
  });

  return profile;
};

export const updateJobSeekerProfile = async (
  userId: string,
  data: {
    bio?: string;
    location?: string;
    skills?: string[];
    education?: string;
    experience?: string;
    resumeUrl?: string;
  }
) => {
  const profile = await prisma.jobSeekerProfile.update({
    where: { userId },
    data,
    include: {
      user: {
        select: { name: true, email: true, roles: true },
      },
    },
  });

  return profile;
};

export const applyToJob = async (
  userId: string,
  jobId: string,
  coverLetter?: string
) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);
  if (!job.isActive) throw new AppError("This job is no longer active", 410);

  const existing = await prisma.application.findFirst({
    where: { jobId, jobSeekerId: jobSeeker.id },
  });
  if (existing) throw new AppError("You have already applied to this job", 409);

  const application = await prisma.application.create({
    data: {
      jobId,
      jobSeekerId: jobSeeker.id,
      coverLetter,
    },
    include: { job: true },
  });

  return application;
};

export const getApplications = async (userId: string) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const applications = await prisma.application.findMany({
    where: { jobSeekerId: jobSeeker.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          salaryRange: true,
          category: true,
          recruiter: {
            select: { companyName: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return applications;
};

export const withdrawApplication = async (
  userId: string,
  applicationId: string
) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) throw new AppError("Application not found", 404);
  if (application.jobSeekerId !== jobSeeker.id)
    throw new AppError("You are not authorized to withdraw this application", 403);

  await prisma.application.delete({ where: { id: applicationId } });
};

export const saveJob = async (userId: string, jobId: string) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);

  const savedJob = await prisma.savedJob.create({
    data: {
      jobId,
      jobSeekerId: jobSeeker.id,
    },
    include: { job: true },
  });

  return savedJob;
};

export const getSavedJobs = async (userId: string) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const savedJobs = await prisma.savedJob.findMany({
    where: { jobSeekerId: jobSeeker.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          salaryRange: true,
          category: true,
          isActive: true,
          recruiter: {
            select: { companyName: true },
          },
        },
      },
    },
    orderBy: { savedAt: "desc" },
  });

  return savedJobs;
};

export const unsaveJob = async (userId: string, jobId: string) => {
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

  const savedJob = await prisma.savedJob.findFirst({
    where: { jobId, jobSeekerId: jobSeeker.id },
  });

  if (!savedJob) throw new AppError("Saved job not found", 404);

  await prisma.savedJob.delete({ where: { id: savedJob.id } });
};
