import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5002),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(16, "ACCESS_TOKEN_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  CORS_ORIGIN: z.string().optional(),
  ACCESS_TOKEN_MAX_AGE_MS: z.coerce
    .number()
    .default(15 * 60 * 1000), // 15 minutes
  REFRESH_TOKEN_MAX_AGE_MS: z.coerce
    .number()
    .default(7 * 24 * 60 * 60 * 1000), // 7 days
  QUEUE_CONCURRENCY: z.coerce.number().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid or missing environment variables:\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

/**
 * Centralised, validated environment configuration.
 * All process.env reads live here — the rest of the codebase
 * works with typed constants rather than raw string comparisons.
 * The app exits immediately at startup if required vars are missing or invalid.
 */
export const ENV = parsed.data;

export const IS_PRODUCTION = ENV.NODE_ENV === "production";
export const IS_DEVELOPMENT = ENV.NODE_ENV === "development";
