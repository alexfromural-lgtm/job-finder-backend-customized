/**
 * Centralised environment configuration.
 * All process.env reads live here so the rest of the codebase
 * works with typed constants rather than raw string comparisons.
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? 5002,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
} as const;

export const IS_PRODUCTION = ENV.NODE_ENV === "production";
export const IS_DEVELOPMENT = ENV.NODE_ENV === "development";
