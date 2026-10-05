import { Request, Response } from "express";
import { geographyService } from "../services/geography.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listSitios = asyncHandler(async (_req: Request, res: Response) => {
  const sitios = await geographyService.listSitios();
  sendSuccess(res, sitios);
});

export const addSitio = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const sitio = await geographyService.addSitio(name, req);
  sendSuccess(res, sitio, 201);
});

export const renameSitio = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body as { name: string };
  const sitio = await geographyService.renameSitio(req.params.id, name, req);
  sendSuccess(res, sitio);
});

export const deleteSitio = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await geographyService.deleteSitio(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const addPurok = asyncHandler(async (req: Request<{ sitioId: string }>, res: Response) => {
  const { name } = req.body as { name: string };
  const purok = await geographyService.addPurok(req.params.sitioId, name, req);
  sendSuccess(res, purok, 201);
});

export const renamePurok = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body as { name: string };
  const purok = await geographyService.renamePurok(req.params.id, name, req);
  sendSuccess(res, purok);
});

export const deletePurok = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await geographyService.deletePurok(req.params.id, req);
  sendSuccess(res, { deleted: true });
});
