import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import { Response } from "express";
import { AppError } from "../errors/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token";
import { IS_PRODUCTION, ENV } from "../config/env";

/**
 * Validates that email and password are provided.
 */
export const validateCredentials = (email?: string | null, password?: string | null) => {
  if (!email || !password) throw new AppError("Email and password are required", 400);
};

/**
 * Handles authorization errors with appropriate HTTP status codes.
 * Prefers AppError.statusCode; falls back to 403 for "not authorized", else 400.
 * @deprecated Prefer throwing AppError with an explicit statusCode instead.
 */
export const handleAuthAwareError = (
  err: any,
  res: Response,
  options?: { keyword: string; keywordStatus: number }
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  let status = err.message.includes("not authorized") ? 403 : 400;
  if (options && err.message.includes(options.keyword)) {
    status = options.keywordStatus;
  }
  res.status(status).json({ error: err.message });
};

/**
 * Maps auth controller errors to semantically correct HTTP status codes.
 * If the error is an AppError, its statusCode is used directly — no message
 * parsing needed, making this handler locale-safe.
 * Falls back to text-matching only for plain Error objects thrown by
 * third-party libraries (Prisma, jsonwebtoken) that we cannot control.
 * - 401 for invalid credentials or expired tokens
 * - 403 for role/permission violations
 * - 404 for missing users/resources
 * - 409 for duplicate resource conflicts (e.g. email already exists)
 * - 400 for all other validation errors
 */
export const handleAuthControllerError = (err: any, res: Response) => {
  const msg: string = err?.message ?? "Unknown error";

  // Prefer structured status code — locale-safe, no string matching needed.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: msg });
  }

  // Fallback: match against known third-party library messages (English only).
  // jsonwebtoken throws these in English regardless of locale.
  if (msg.includes("jwt expired") || msg.includes("invalid token") || msg.includes("jwt malformed")) {
    return res.status(401).json({ error: msg });
  }

  // Prisma unique constraint violation (P2002) — not locale-dependent.
  if ((err as any)?.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }

  // Any remaining plain errors default to 400 (client mistake).
  return res.status(400).json({ error: msg });
};

/**
 * Checks if a user already exists by email.
 */
export const checkUserExistsByEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("User already exists", 409);
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
    maxAge: ENV.REFRESH_TOKEN_MAX_AGE_MS, // 7 days
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
    maxAge: ENV.ACCESS_TOKEN_MAX_AGE_MS, // 15 minutes
  });
}
