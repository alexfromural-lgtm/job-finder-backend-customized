import prisma from "../prisma/client";
import * as RecruiterService from "../services/recruiter.service";

export const createJob = async (userId: string, jobData: any) => {
  const job = await prisma.job.create({
    data: {
      recruiterId: userId,
      ...jobData,
    },
  });

  return job;
};

export const getJobById = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  return job;
};

export const updateJob = async (jobId: string, jobData: any) => {
  const job = await prisma.job.update({
    where: { id: jobId },
    data: jobData,
  });

  return job;
}

export const deleteJob = async (jobId: string) => {
  await prisma.job.delete({
    where: { id: jobId },
  });
}

export const getJobsByRecruiter = async (recruiterId: string) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId },
  });

  return jobs;
};

export const getAllJobs = async () => {
  const jobs = await prisma.job.findMany();
  return jobs;
};  

