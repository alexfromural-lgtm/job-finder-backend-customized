import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { comparePasswords, hashPassword } from "../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { RecruiterSignupInput } from "../validators/recruiter.schema";

// Helper: Validate email and password are provided
const validateCredentials = (email?: string | null, password?: string | null) => {
  if (!email || !password) throw new Error("Email and password are required");
};

// Helper: Check if user already exists by email
const checkUserExistsByEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");
};

// Helper: Generate JWT tokens for a user
const generateTokensForUser = async (userId: string, roles: Role[]) => {
  const accessToken = generateAccessToken(userId, roles);
  const refreshToken = generateRefreshToken(userId, roles);
  return { accessToken, refreshToken };
};

export const signupJobSeeker = async (
  name: string,
  email: string,
  password: string
) => {
  validateCredentials(email, password);
  await checkUserExistsByEmail(email);

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

  return generateTokensForUser(user.id, user.roles);
};

export const signupRecruitor = async (data: RecruiterSignupInput) => {
  const { name, email, password, companyName, companyWebsite, description, industry } = data;

  validateCredentials(email, password);
  await checkUserExistsByEmail(email);

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      roles: [Role.RECRUITER],
      recruiter: {
        create: {
          companyName,
          companyWebsite,
          description,
          industry,
        },
      },
    },
    include: { recruiter: true },
  });

  return generateTokensForUser(user.id, user.roles);
};

export const upgradeToRecruiter = async (userId: string, data: RecruiterSignupInput) => {
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
};

export const login = async (email: string, password: string) => {
  validateCredentials(email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const valid = await comparePasswords(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  return generateTokensForUser(user.id, user.roles);
};

export const refreshTokens = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error("User not found");
  if (!user.isActive) throw new Error("Account is deactivated");

  return generateTokensForUser(user.id, user.roles);
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
};
