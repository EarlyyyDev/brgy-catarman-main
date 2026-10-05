import { Request, Response } from "express";
import { officialService } from "../services/official.service";
import { emergencyContactService } from "../services/emergencyContact.service";
import { activityService } from "../services/activity.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listOfficials = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await officialService.list());
});
export const createOfficial = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await officialService.create(req.body, req), 201);
});
export const updateOfficial = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  sendSuccess(res, await officialService.update(req.params.id, req.body, req));
});
export const deleteOfficial = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await officialService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const listEmergencyContacts = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await emergencyContactService.list());
});
export const createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await emergencyContactService.create(req.body, req), 201);
});
export const updateEmergencyContact = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  sendSuccess(res, await emergencyContactService.update(req.params.id, req.body, req));
});
export const deleteEmergencyContact = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await emergencyContactService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const listActivities = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await activityService.list(req.query.upcomingOnly === "true"));
});
export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await activityService.create(req.body, req), 201);
});
export const updateActivity = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  sendSuccess(res, await activityService.update(req.params.id, req.body, req));
});
export const deleteActivity = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await activityService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
