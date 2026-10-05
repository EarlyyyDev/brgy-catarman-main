import { Request, Response } from "express";
import { blotterTemplateService } from "../services/blotterTemplate.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listBlotterTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const templates = await blotterTemplateService.list();
  sendSuccess(res, templates);
});

export const getBlotterTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const template = await blotterTemplateService.getById(req.params.id);
  sendSuccess(res, template);
});

export const createBlotterTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await blotterTemplateService.create(req.body, req);
  sendSuccess(res, template, 201);
});

export const updateBlotterTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const template = await blotterTemplateService.update(req.params.id, req.body, req);
  sendSuccess(res, template);
});

export const deleteBlotterTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await blotterTemplateService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
