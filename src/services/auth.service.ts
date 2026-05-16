import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { comparePasswords, hashPassword } from "../utils/hash";
import {
  validateCredentials,
  checkUserExistsByEmail,
  generateTokensForUser,
} from "../utils/auth.utils";
import { verifyRefreshToken } from "../utils/token";
import { RecruiterSignupInput } from "../validators/recruiter.schema";
import { AppError } from "../errors/AppError";

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

/**
 * Signup for a new recruiter account.
 * (Note: previously named signupRecruitor — typo fixed)
 */
export const signupRecruiter = async (data: RecruiterSignupInput) => {
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

/**
 * Upgrades an existing JOB_SEEKER to also have the RECRUITER role.
 * Returns new tokens immediately so the user does not need to re-login.
 */
export const upgradeToRecruiter = async (
  userId: string,
  data: RecruiterSignupInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { recruiter: true },
  });

  if (!user) throw new AppError("User not found", 404);
  if (!user.roles.includes(Role.JOB_SEEKER))
    throw new AppError("Only Job Seekers can upgrade to Recruiter", 403);
  if (user.recruiter)
    throw new AppError("User already has a recruiter profile", 409);

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

  // Re-issue tokens so the new RECRUITER role is reflected immediately
  const tokens = await generateTokensForUser(updatedUser.id, updatedUser.roles);
  return { user: updatedUser, tokens };
};

export const login = async (email: string, password: string) => {
  validateCredentials(email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const valid = await comparePasswords(password, user.password);
  if (!valid) throw new AppError("Invalid email or password", 401); // Same message — avoids leaking which field is wrong

  return generateTokensForUser(user.id, user.roles);
};

export const refreshTokens = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

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

  if (!user) throw new AppError("User not found", 404);
  return user;
};
