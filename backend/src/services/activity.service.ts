import { Request } from "express";
import { activityRepository } from "../repositories/activity.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface ActivityInput {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

async function list(upcomingOnly = false) {
  return activityRepository.list(upcomingOnly);
}

async function create(input: ActivityInput, req: Request) {
  const activity = await activityRepository.create({
    ...input,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
  });
  await activityLogService.log({ req, action: "Added upcoming activity", module: "ANNOUNCEMENTS", description: activity.title });
  return activity;
}

async function update(id: string, input: Partial<ActivityInput>, req: Request) {
  const existing = await activityRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Activity not found");
  }
  const activity = await activityRepository.update(id, {
    ...input,
    ...(input.startDate ? { startDate: new Date(input.startDate) } : {}),
    ...(input.endDate ? { endDate: new Date(input.endDate) } : {}),
  });
  await activityLogService.log({ req, action: "Updated upcoming activity", module: "ANNOUNCEMENTS", description: activity.title });
  return activity;
}

async function remove(id: string, req: Request) {
  const existing = await activityRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Activity not found");
  }
  await activityRepository.softDelete(id);
  await activityLogService.log({ req, action: "Removed upcoming activity", module: "ANNOUNCEMENTS", description: existing.title });
}

export const activityService = { list, create, update, remove };
