import { Request } from "express";
import { documentTypeRepository } from "../repositories/documentType.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface DocumentTypeInput {
  name: string;
  code: string;
  description?: string;
  requirements?: string[];
  fee?: number;
  validityDays?: number;
  isActive?: boolean;
}

async function list(activeOnly = false) {
  return documentTypeRepository.list(activeOnly);
}

async function create(input: DocumentTypeInput, req: Request) {
  const docType = await documentTypeRepository.create({
    ...input,
    requirements: input.requirements ?? [],
  });
  await activityLogService.log({
    req,
    action: "Added new document type",
    module: "SETTINGS",
    description: docType.name,
  });
  return docType;
}

async function update(id: string, input: Partial<DocumentTypeInput>, req: Request) {
  const existing = await documentTypeRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Document type not found");
  }
  const docType = await documentTypeRepository.update(id, input);
  await activityLogService.log({
    req,
    action: "Updated document type",
    module: "SETTINGS",
    description: docType.name,
  });
  return docType;
}

async function remove(id: string, req: Request) {
  const existing = await documentTypeRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Document type not found");
  }
  await documentTypeRepository.softDelete(id);
  await activityLogService.log({
    req,
    action: "Deleted document type",
    module: "SETTINGS",
    description: existing.name,
  });
}

export const documentTypeService = { list, create, update, remove };
