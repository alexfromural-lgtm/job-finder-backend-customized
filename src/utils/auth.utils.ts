import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { Response } from "express";
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
 * Handles authorization errors with appropriate HTTP status codes.
 * By default returns 403 for "not authorized" errors, 400 for other validation errors.
 * Pass `options.keyword` + `options.keywordStatus` to map an additional keyword to a custom status.
 */
export const handleAuthAwareError = (
  err: any,
  res: Response,
  options?: { keyword: string; keywordStatus: number }
) => {
  let status = err.message.includes("not authorized") ? 403 : 400;
  if (options && err.message.includes(options.keyword)) {
    status = options.keywordStatus;
  }
  res.status(status).json({ error: err.message });
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

/**
 * Sets the refresh token cookie with standard options.
 */
export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
}
