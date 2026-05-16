/**
 * Application-level error that carries a semantic HTTP status code.
 * Throw this instead of plain `new Error(...)` so error handlers can
 * map to the correct status WITHOUT inspecting message text — which
 * breaks for non-English messages or future i18n.
 *
 * Usage:
 *   throw new AppError("User not found", 404);
 *   throw new AppError("Invalid credentials", 401);
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AppError";
    // Maintains correct prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
