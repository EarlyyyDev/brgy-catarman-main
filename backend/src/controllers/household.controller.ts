import { Request, Response } from "express";
import { householdService } from "../services/household.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listHouseholds = asyncHandler(async (req: Request, res: Response) => {
  const { search, purokId, sitioId, isArchived } = req.query as Record<string, string | undefined>;
  const result = await householdService.list(req, {
    search,
    purokId,
    sitioId,
    isArchived: isArchived === "true" ? true : isArchived === "false" ? false : undefined,
  });
  sendSuccess(res, result);
});

export const getHousehold = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const household = await householdService.getById(req.params.id);
  sendSuccess(res, household);
});

export const createHousehold = asyncHandler(async (req: Request, res: Response) => {
  const household = await householdService.create(req.body, req);
  sendSuccess(res, household, 201);
});

export const updateHousehold = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const household = await householdService.update(req.params.id, req.body, req);
  sendSuccess(res, household);
});

export const archiveHousehold = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const household = await householdService.archive(req.params.id, req);
  sendSuccess(res, household);
});

export const restoreHousehold = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const household = await householdService.restore(req.params.id, req);
  sendSuccess(res, household);
});

export const deleteHousehold = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await householdService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
