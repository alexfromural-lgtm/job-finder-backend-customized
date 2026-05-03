import { ApplicationStatus } from "@prisma/client";
import prisma from "../prisma/client";

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

  if (!recruiter) throw new Error("Recruiter profile not found");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");
  if (job.recruiterId !== recruiter.id)
    throw new Error("You are not authorized to view applications for this job");

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

  if (!recruiter) throw new Error("Recruiter profile not found");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application) throw new Error("Application not found");
  if (application.job.recruiterId !== recruiter.id)
    throw new Error("You are not authorized to update this application");

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
