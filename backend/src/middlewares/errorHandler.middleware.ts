import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.util";
import { sendError } from "../utils/apiResponse.util";
import { logger } from "../utils/logger.util";
import { isTransientDbError } from "../utils/transientDbError.util";

// Neon's serverless compute suspending after inactivity is the single most
// common failure mode seen in local development -- asyncHandler already
// retries these once/twice for GET requests, so reaching here means retries
// were exhausted (or it was a mutating request, which is never auto-retried).
// Surface it as a clear, actionable 503 instead of a generic 500 so it's
// obviously "try again in a moment", not "something is broken".

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { path: req.path, details: err.details });
    }
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 422, "Validation failed", err.flatten());
    return;
  }

  if (isTransientDbError(err)) {
    logger.error("Database temporarily unreachable", { path: req.path, err });
    sendError(res, 503, "Database is temporarily unavailable. Please try again in a moment.");
    return;
  }

  logger.error("Unhandled error", { path: req.path, err });
  sendError(res, 500, "Internal server error");
}
