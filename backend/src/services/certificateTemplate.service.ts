import { Request } from "express";
import { certificateTemplateRepository } from "../repositories/certificateTemplate.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface CertificateTemplateInput {
  name: string;
  documentTypeId: string;
  status?: "ACTIVE" | "INACTIVE";
  requireResidentPhoto?: boolean;
  showBarangayLogo?: boolean;
  showMunicipalLogo?: boolean;
  showBarangayDrySeal?: boolean;
  logoSize?: number;
  bodyHtml: string;
}

async function list(documentTypeId?: string) {
  return certificateTemplateRepository.list(documentTypeId);
}

async function getById(id: string) {
  const template = await certificateTemplateRepository.findById(id);
  if (!template) {
    throw ApiError.notFound("Certificate template not found");
  }
  return template;
}

async function create(input: CertificateTemplateInput, req: Request) {
  const template = await certificateTemplateRepository.create(input);
  await activityLogService.log({
    req,
    action: "Added new certificate template",
    module: "SETTINGS",
    description: template.name,
  });
  return template;
}

async function update(id: string, input: Partial<CertificateTemplateInput>, req: Request) {
  await getById(id);
  const template = await certificateTemplateRepository.update(id, input);
  await activityLogService.log({
    req,
    action: "Updated certificate template",
    module: "SETTINGS",
    description: template.name,
  });
  return template;
}

async function remove(id: string, req: Request) {
  const existing = await getById(id);
  await certificateTemplateRepository.softDelete(id);
  await activityLogService.log({
    req,
    action: "Deleted certificate template",
    module: "SETTINGS",
    description: existing.name,
  });
}

export const certificateTemplateService = { list, getById, create, update, remove };
