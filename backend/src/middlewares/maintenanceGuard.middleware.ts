import { Request, Response, NextFunction } from "express";
import { settingsRepository } from "../repositories/settings.repository";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendError } from "../utils/apiResponse.util";

/** Blocks anonymous/public submissions (certificate requests, complaints,
 * comments, reactions, contact form) while maintenance mode is on -- the
 * frontend already hides the public site behind a maintenance screen, but
 * this stops a direct API call from bypassing that. Read-only public
 * endpoints (settings, announcements, document types, etc.) are deliberately
 * left unguarded so the public site can still detect maintenance mode and
 * render its own read-only content. Staff/admin routes are untouched --
 * maintenance mode never blocks the dashboard. */
export const maintenanceGuard = asyncHandler(async (_req: Request, res: Response, next: NextFunction) => {
  const settings = await settingsRepository.get();
  if (settings?.maintenanceMode) {
    sendError(
      res,
      503,
      "The system is temporarily under maintenance. Please try again later.",
    );
    return;
  }
  next();
});
