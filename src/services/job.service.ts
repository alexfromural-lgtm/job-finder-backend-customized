import prisma from "../prisma/client";

export const createJob = async (recruiterId: string, jobData: any) => {
  const job = await prisma.job.create({
    data: {
      recruiterId,
      ...jobData,
    },
  });

  return job;
};

export const getJobById = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      recruiter: {
        select: { companyName: true, industry: true },
      },
    },
  });

  return job;
};

export const updateJob = async (
  jobId: string,
  recruiterId: string,
  jobData: any
) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) throw new Error("Job not found");
  if (job.recruiterId !== recruiterId)
    throw new Error("You are not authorized to update this job");

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: jobData,
  });

  return updated;
};

export const deleteJob = async (jobId: string, recruiterId: string) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) throw new Error("Job not found");
  if (job.recruiterId !== recruiterId)
    throw new Error("You are not authorized to delete this job");

  await prisma.job.delete({ where: { id: jobId } });
};

export const getJobsByRecruiter = async (recruiterId: string) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
};

export const getAllJobs = async (filters?: {
  category?: string;
  location?: string;
  search?: string;
}) => {
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.location && {
        location: { contains: filters.location, mode: "insensitive" },
      }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      recruiter: {
        select: { companyName: true, industry: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
};
