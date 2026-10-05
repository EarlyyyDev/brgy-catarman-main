import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { userRepository } from "../repositories/user.repository";
import { sessionRepository } from "../repositories/session.repository";
import { ApiError } from "../utils/apiError.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) {
    throw ApiError.unauthorized("Authentication required");
  }

  let payload;
  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const [user, session] = await Promise.all([
    userRepository.findById(payload.sub),
    sessionRepository.findActiveById(payload.sid),
  ]);

  if (!user || user.status !== "ACTIVE" || !session) {
    throw ApiError.unauthorized("Session is no longer valid");
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionId: session.id,
  };

  next();
});

/**
 * For public endpoints (e.g. announcement comments) that a logged-in staff
 * member might also hit while browsing the public site. Populates req.user
 * from a valid session if present, but never rejects the request if it's
 * missing or invalid — the route itself decides how to attribute an
 * anonymous vs. authenticated actor.
 */
export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(accessToken);
    const [user, session] = await Promise.all([
      userRepository.findById(payload.sub),
      sessionRepository.findActiveById(payload.sid),
    ]);

    if (user && user.status === "ACTIVE" && session) {
      req.user = { id: user.id, email: user.email, name: user.name, role: user.role, sessionId: session.id };
    }
  } catch {
    // Invalid/expired token on an optional-auth route — proceed anonymously.
  }

  next();
});
