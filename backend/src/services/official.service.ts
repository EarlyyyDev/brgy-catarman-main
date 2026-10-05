import { Request } from "express";
import { officialRepository } from "../repositories/official.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface OfficialInput {
  name: string;
  position: string;
  committee?: string;
  photoUrl?: string;
  order?: number;
  termStart: string;
  termEnd: string;
  contactNumber?: string;
  email?: string;
}

async function list() {
  return officialRepository.list();
}

async function create(input: OfficialInput, req: Request) {
  const official = await officialRepository.create({
    ...input,
    termStart: new Date(input.termStart),
    termEnd: new Date(input.termEnd),
  });
  await activityLogService.log({ req, action: "Added new official", module: "SETTINGS", description: official.name });
  return official;
}

async function update(id: string, input: Partial<OfficialInput>, req: Request) {
  const existing = await officialRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Official not found");
  }
  const official = await officialRepository.update(id, {
    ...input,
    ...(input.termStart ? { termStart: new Date(input.termStart) } : {}),
    ...(input.termEnd ? { termEnd: new Date(input.termEnd) } : {}),
  });
  await activityLogService.log({ req, action: "Updated official", module: "SETTINGS", description: official.name });
  return official;
}

async function remove(id: string, req: Request) {
  const existing = await officialRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Official not found");
  }
  await officialRepository.softDelete(id);
  await activityLogService.log({ req, action: "Removed official", module: "SETTINGS", description: existing.name });
}

export const officialService = { list, create, update, remove };
