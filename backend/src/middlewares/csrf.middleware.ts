import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse.util";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// No session cookie exists yet at these steps, so there is nothing for a forged
// cross-site request to ride along with; they are protected by other means
// (rate limiting, credential/token verification) instead of the CSRF header.
const EXEMPT_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password/questions",
  "/api/auth/reset-password",
]);

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.csrf_token as string | undefined;
  if (!cookieToken) {
    // No active session cookie to protect against CSRF for this request.
    next();
    return;
  }

  const headerToken = req.header("X-CSRF-Token");
  if (!headerToken || headerToken !== cookieToken) {
    sendError(res, 403, "Invalid or missing CSRF token");
    return;
  }

  next();
}
