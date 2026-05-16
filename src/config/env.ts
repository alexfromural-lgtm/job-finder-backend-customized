/**
 * Centralised environment configuration.
 * All process.env reads live here so the rest of the codebase
 * works with typed constants rather than raw string comparisons.
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? 5002,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ACCESS_TOKEN_MAX_AGE_MS: Number(process.env.ACCESS_TOKEN_MAX_AGE_MS) || 15 * 60 * 1000,
  REFRESH_TOKEN_MAX_AGE_MS: Number(process.env.REFRESH_TOKEN_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
} as const;

export const IS_PRODUCTION = ENV.NODE_ENV === "production";
export const IS_DEVELOPMENT = ENV.NODE_ENV === "development";
