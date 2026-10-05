import { Request, Response } from "express";
import { documentTypeService } from "../services/documentType.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listDocumentTypes = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = req.query.activeOnly === "true";
  const docTypes = await documentTypeService.list(activeOnly);
  sendSuccess(res, docTypes);
});

export const createDocumentType = asyncHandler(async (req: Request, res: Response) => {
  const docType = await documentTypeService.create(req.body, req);
  sendSuccess(res, docType, 201);
});

export const updateDocumentType = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const docType = await documentTypeService.update(req.params.id, req.body, req);
  sendSuccess(res, docType);
});

export const deleteDocumentType = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await documentTypeService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
