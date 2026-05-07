import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token";

/**
 * Validates that email and password are provided.
 */
export const validateCredentials = (email?: string | null, password?: string | null) => {
  if (!email || !password) throw new Error("Email and password are required");
};

/**
 * Checks if a user already exists by email.
 */
export const checkUserExistsByEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");
};

/**
 * Generates JWT tokens for a user.
 */
export const generateTokensForUser = async (userId: string, roles: Role[]) => {
  const accessToken = generateAccessToken(userId, roles);
  const refreshToken = generateRefreshToken(userId, roles);
  return { accessToken, refreshToken };
};
