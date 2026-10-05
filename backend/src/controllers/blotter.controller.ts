import { Request, Response } from "express";
import { blotterService } from "../services/blotter.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listBlotters = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, isArchived } = req.query as Record<string, string | undefined>;
  const result = await blotterService.list(req, {
    search,
    status,
    isArchived: isArchived === "true" ? true : isArchived === "false" ? false : undefined,
  });
  sendSuccess(res, result);
});

export const getBlotter = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const blotter = await blotterService.getById(req.params.id);
  sendSuccess(res, blotter);
});

export const createBlotter = asyncHandler(async (req: Request, res: Response) => {
  const blotter = await blotterService.create(req.body, req);
  sendSuccess(res, blotter, 201);
});

export const updateBlotter = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const blotter = await blotterService.update(req.params.id, req.body, req);
  sendSuccess(res, blotter);
});

export const updateBlotterStatus = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { status, resolution } = req.body as {
    status: "OPEN" | "UNDER_MEDIATION" | "SETTLED" | "ESCALATED_TO_COURT" | "CLOSED" | "ARCHIVED";
    resolution?: string;
  };
  const blotter = await blotterService.updateStatus(req.params.id, status, req, resolution);
  sendSuccess(res, blotter);
});

export const archiveBlotter = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const blotter = await blotterService.archive(req.params.id, req);
  sendSuccess(res, blotter);
});

export const deleteBlotter = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await blotterService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const addHearing = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { date, notes } = req.body as { date: string; notes?: string };
  const hearing = await blotterService.addHearing(req.params.id, date, notes, req);
  sendSuccess(res, hearing, 201);
});

export const updateHearingStatus = asyncHandler(async (req: Request<{ id: string; hearingId: string }>, res: Response) => {
  const { status } = req.body as { status: "SCHEDULED" | "COMPLETED" | "CANCELLED" };
  const hearing = await blotterService.updateHearingStatus(req.params.id, req.params.hearingId, status, req);
  sendSuccess(res, hearing);
});

export const addCaseNote = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { note } = req.body as { note: string };
  const blotter = await blotterService.addCaseNote(req.params.id, note, req);
  sendSuccess(res, blotter, 201);
});
