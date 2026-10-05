import { Request } from "express";
import { emergencyContactRepository } from "../repositories/emergencyContact.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface EmergencyContactInput {
  name: string;
  category: "POLICE" | "FIRE" | "MEDICAL" | "DISASTER_RESPONSE" | "BARANGAY_HOTLINE" | "OTHER";
  contactNumber: string;
  address?: string;
  availability: string;
}

async function list() {
  return emergencyContactRepository.list();
}

async function create(input: EmergencyContactInput, req: Request) {
  const contact = await emergencyContactRepository.create(input);
  await activityLogService.log({ req, action: "Added emergency contact", module: "SETTINGS", description: contact.name });
  return contact;
}

async function update(id: string, input: Partial<EmergencyContactInput>, req: Request) {
  const existing = await emergencyContactRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Emergency contact not found");
  }
  const contact = await emergencyContactRepository.update(id, input);
  await activityLogService.log({ req, action: "Updated emergency contact", module: "SETTINGS", description: contact.name });
  return contact;
}

async function remove(id: string, req: Request) {
  const existing = await emergencyContactRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Emergency contact not found");
  }
  await emergencyContactRepository.remove(id);
  await activityLogService.log({ req, action: "Removed emergency contact", module: "SETTINGS", description: existing.name });
}

export const emergencyContactService = { list, create, update, remove };
