import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * Global Express error handler.
 * Must be mounted AFTER all routes in index.ts.
 * All controllers should call next(err) instead of sending their own error responses.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Structured AppError — use its status code directly (locale-safe)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const msg: string = (err as any)?.message ?? "Unknown error";

  // Prisma unique constraint (P2002) — not locale-dependent
  if ((err as any)?.code === "P2002") {
    res.status(409).json({ error: "A record with that value already exists." });
    return;
  }

  // jsonwebtoken throws these in English regardless of locale
  if (
    msg.includes("jwt expired") ||
    msg.includes("invalid token") ||
    msg.includes("jwt malformed")
  ) {
    res.status(401).json({ error: msg });
    return;
  }

  // Log unexpected errors for debugging (avoid leaking internals to client)
  console.error("[Unhandled Error]", err);
  res.status(500).json({ error: "Internal server error" });
};
