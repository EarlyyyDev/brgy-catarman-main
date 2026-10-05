import { Request, Response } from "express";
import { residentService } from "../services/resident.service";
import { residentRepository } from "../repositories/resident.repository";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const listResidents = asyncHandler(async (req: Request, res: Response) => {
  const { search, purokId, householdId, tagType } = req.query as Record<string, string | undefined>;
  const result = await residentService.list(req, { search, purokId, householdId, tagType });
  sendSuccess(res, result);
});

export const getResident = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const resident = await residentService.getById(req.params.id);
  sendSuccess(res, resident);
});

export const createResident = asyncHandler(async (req: Request, res: Response) => {
  const resident = await residentService.create(req.body, req);
  sendSuccess(res, resident, 201);
});

export const updateResident = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const resident = await residentService.update(req.params.id, req.body, req);
  sendSuccess(res, resident);
});

export const deleteResident = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await residentService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const assignResidentTags = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { tags } = req.body as { tags: { tagType: string; remarks?: string; effectiveDate?: string; expiryDate?: string }[] };
  const resident = await residentService.assignTags(req.params.id, tags, req);
  sendSuccess(res, resident);
});

export const searchPublicResidents = asyncHandler(async (req: Request, res: Response) => {
  const query = String(req.query.q ?? "").trim();
  if (query.length < 2) {
    sendSuccess(res, []);
    return;
  }
  const residents = await residentRepository.searchPublic(query);
  const results = residents.map((r) => ({
    id: r.id,
    fullName: [r.firstName, r.middleName, r.lastName, r.suffix].filter(Boolean).join(" "),
    purok: r.purok.name,
    sitio: r.purok.sitio.name,
  }));
  sendSuccess(res, results);
});

export const uploadResidentPhoto = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  const url = publicUrlFor("residents", req.file.filename);
  const resident = await residentService.update(req.params.id, { photoUrl: url }, req);
  sendSuccess(res, resident);
});
