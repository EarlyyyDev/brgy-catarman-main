import { Request } from "express";
import { ActivityModule, ActivityActorRole, ActivityStatus } from "@prisma/client";
import { activityLogRepository } from "../repositories/activityLog.repository";

function extractIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? undefined;
}

function extractBrowser(req: Request): string | undefined {
  return req.headers["user-agent"];
}

/**
 * Writes an activity-log entry using the AUTHENTICATED session's real
 * identity (req.user, attached by requireAuth) as the actor — never a
 * client-supplied name/role. This is the deliberate fix for the frontend
 * prototype's bug where every store hardcoded a fixed actorRole per module
 * regardless of who was actually logged in (e.g. an Administrator editing a
 * resident was logged as "Staff"). System-triggered events (no req.user)
 * pass actor: null and get ActivityActorRole.SYSTEM.
 */
async function log(params: {
  req: Request;
  action: string;
  module: ActivityModule;
  description?: string;
  status?: ActivityStatus;
}) {
  const { req, action, module, description, status } = params;
  const user = req.user;

  await activityLogRepository.create({
    actorId: user?.id ?? null,
    actorName: user?.name ?? "System",
    actorRole: user ? (user.role as ActivityActorRole) : ActivityActorRole.SYSTEM,
    action,
    module,
    description,
    ipAddress: extractIp(req),
    browser: extractBrowser(req),
    status: status ?? ActivityStatus.SUCCESS,
  });
}

export const activityLogService = { log };
