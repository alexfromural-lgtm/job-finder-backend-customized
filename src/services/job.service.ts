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
        select: { companyName: true, industry: true, companyWebsite: true },
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
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 10));
  const skip = (page - 1) * pageSize;

  const where = {
    isActive: true,
    ...(filters?.category && { category: filters.category }),
    ...(filters?.location && {
      location: { contains: filters.location, mode: "insensitive" as const },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" as const } },
        { description: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      include: {
        recruiter: { select: { companyName: true, industry: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};
