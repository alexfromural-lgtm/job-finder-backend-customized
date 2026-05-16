import { ApplicationStatus } from "@prisma/client";
import prisma from "../prisma/client";
import { AppError } from "../errors/AppError";

export const getRecruiterProfile = async (userId: string) => {
  const profile = await prisma.recruiterProfile.findUnique({
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

export const updateRecruiterProfile = async (
  userId: string,
  data: {
    companyName?: string;
    companyWebsite?: string;
    description?: string;
    industry?: string;
  }
) => {
  const profile = await prisma.recruiterProfile.update({
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

export const getApplicationsForJob = async (
  userId: string,
  jobId: string
) => {
  // Verify the recruiter owns this job
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId },
  });

  if (!recruiter) throw new AppError("Recruiter profile not found", 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);
  if (job.recruiterId !== recruiter.id)
    throw new AppError("You are not authorized to view applications for this job", 403);

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      jobSeeker: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return applications;
};

export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  status: ApplicationStatus
) => {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId },
  });

  if (!recruiter) throw new AppError("Recruiter profile not found", 404);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application) throw new AppError("Application not found", 404);
  if (application.job.recruiterId !== recruiter.id)
    throw new AppError("You are not authorized to update this application", 403);

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: {
      job: { select: { title: true } },
      jobSeeker: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  return updated;
};
