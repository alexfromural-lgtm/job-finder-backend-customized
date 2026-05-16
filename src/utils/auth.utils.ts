import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token";
import { IS_PRODUCTION } from "../config/env";

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
 * Maps auth controller errors to semantically correct HTTP status codes.
 * - 401 for invalid credentials or expired tokens
 * - 403 for role/permission violations
 * - 404 for missing users/resources
 * - 409 for duplicate resource conflicts (e.g. email already exists)
 * - 400 for all other validation errors
 */
export const handleAuthControllerError = (err: any, res: Response) => {
  const msg: string = err?.message ?? "Unknown error";

  if (msg.includes("Invalid email or password") || msg.includes("expired")) {
    return res.status(401).json({ error: msg });
  }
  if (msg.includes("not authorized") || msg.includes("Only Job Seekers")) {
    return res.status(403).json({ error: msg });
  }
  if (msg.includes("not found") || msg.includes("Not found")) {
    return res.status(404).json({ error: msg });
  }
  if (msg.includes("already exists")) {
    return res.status(409).json({ error: msg });
  }

  return res.status(400).json({ error: msg });
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
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Sets the access token as an HTTP-only cookie.
 * Short-lived (15 min) to match ACCESS_TOKEN_EXPIRES_IN.
 * JS cannot read this cookie, eliminating XSS-based token theft.
 */
export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}
