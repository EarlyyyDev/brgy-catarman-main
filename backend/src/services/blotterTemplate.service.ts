import { Request } from "express";
import { blotterTemplateRepository } from "../repositories/blotterTemplate.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface BlotterTemplateInput {
  name: string;
  status?: "ACTIVE" | "INACTIVE";
  showBarangayLogo?: boolean;
  showMunicipalLogo?: boolean;
  showBarangayDrySeal?: boolean;
  logoSize?: number;
  bodyHtml: string;
}

async function list() {
  return blotterTemplateRepository.list();
}

async function getById(id: string) {
  const template = await blotterTemplateRepository.findById(id);
  if (!template) {
    throw ApiError.notFound("Blotter template not found");
  }
  return template;
}

async function create(input: BlotterTemplateInput, req: Request) {
  const template = await blotterTemplateRepository.create(input);
  await activityLogService.log({ req, action: "Added new blotter template", module: "SETTINGS", description: template.name });
  return template;
}

async function update(id: string, input: Partial<BlotterTemplateInput>, req: Request) {
  await getById(id);
  const template = await blotterTemplateRepository.update(id, input);
  await activityLogService.log({ req, action: "Updated blotter template", module: "SETTINGS", description: template.name });
  return template;
}

async function remove(id: string, req: Request) {
  const existing = await getById(id);
  await blotterTemplateRepository.softDelete(id);
  await activityLogService.log({ req, action: "Deleted blotter template", module: "SETTINGS", description: existing.name });
}

export const blotterTemplateService = { list, getById, create, update, remove };
