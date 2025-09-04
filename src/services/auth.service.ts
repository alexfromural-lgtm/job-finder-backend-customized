import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { comparePasswords, hashPassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { RecruiterSignupInput } from "../validators/recruiter.schema";

export const signupJobSeeker = async (
  name: string,
  email: string,
  password: string
) => {
  if (!email || !password) throw new Error("Email and password are required");

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) throw new Error("User already exists");

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      roles: [Role.JOB_SEEKER],
      jobSeeker: { create: {} },
    },
  });

  const accessToken = generateAccessToken(user.id, user.roles);
  const refreshToken = generateRefreshToken(user.id, user.roles);

  return { accessToken, refreshToken };
};

export const signupRecruitor = async (data: RecruiterSignupInput) => {
  const {
    name,
    email,
    password,
    companyName,
    companyWebsite,
    description,
    industry,
  } = data;

  if (!email || !password) throw new Error("Email and password are required");

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) throw new Error("User already exists");

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashed,
      roles: [Role.RECRUITER],
      recruiter: {
        create: {
          companyName: companyName,
          companyWebsite: companyWebsite,
          description: description,
          industry: industry,
        },
      },
    },
    include: { recruiter: true },
  });

  const accessToken = generateAccessToken(user.id, user.roles);
  const refreshToken = generateRefreshToken(user.id, user.roles);

  return { accessToken, refreshToken };
};

export const upgradeToRecruiter = async(userId: string, data: RecruiterSignupInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { recruiter: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.roles.includes(Role.JOB_SEEKER)) throw new Error("Only Job Seekers can upgrade");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      roles: [...user.roles, Role.RECRUITER],
      recruiter: {
        create: {
          companyName: data.companyName,
          companyWebsite: data.companyWebsite,
          description: data.description,
          industry: data.industry,
        },
      },
    },
    include: { recruiter: true },
  });

  return updatedUser;
}

export const login = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and Password required");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid email or password");

  const valid = await comparePasswords(password, user.password);
  if (!valid) throw new Error("Invalid email or password");

  const accessToken = generateAccessToken(user.id, user.roles);
  const refreshToken = generateRefreshToken(user.id, user.roles);

  return { accessToken, refreshToken };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
};
