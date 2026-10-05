import { Request, Response } from "express";
import { certificateTemplateService } from "../services/certificateTemplate.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listCertificateTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { documentTypeId } = req.query as { documentTypeId?: string };
  const templates = await certificateTemplateService.list(documentTypeId);
  sendSuccess(res, templates);
});

export const getCertificateTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const template = await certificateTemplateService.getById(req.params.id);
  sendSuccess(res, template);
});

export const createCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await certificateTemplateService.create(req.body, req);
  sendSuccess(res, template, 201);
});

export const updateCertificateTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const template = await certificateTemplateService.update(req.params.id, req.body, req);
  sendSuccess(res, template);
});

export const deleteCertificateTemplate = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await certificateTemplateService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
