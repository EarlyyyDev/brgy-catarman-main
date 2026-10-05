import { Request } from "express";
import { residentRepository, ResidentListFilters } from "../repositories/resident.repository";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface ResidentInput {
  photoUrl?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender: "MALE" | "FEMALE";
  birthdate: string;
  civilStatus: "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED" | "DIVORCED";
  religion?: string;
  occupation?: string;
  educationalAttainment?: string;
  purokId: string;
  street: string;
  houseNumber?: string;
  contactNumber: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  isRegisteredVoter?: boolean;
}

async function list(req: Request, filters: Omit<ResidentListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await residentRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const resident = await residentRepository.findById(id);
  if (!resident) {
    throw ApiError.notFound("Resident not found");
  }
  return resident;
}

async function create(input: ResidentInput, req: Request) {
  const resident = await residentRepository.create({
    ...input,
    birthdate: new Date(input.birthdate),
    houseNumber: input.houseNumber ?? "",
    createdById: req.user!.id,
  });

  await activityLogService.log({
    req,
    action: "Added new resident record",
    module: "RESIDENTS",
    description: `${resident.firstName} ${resident.lastName}`,
  });

  return resident;
}

async function update(id: string, input: Partial<ResidentInput>, req: Request) {
  const existing = await residentRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Resident not found");
  }

  const resident = await residentRepository.update(id, {
    ...input,
    ...(input.birthdate ? { birthdate: new Date(input.birthdate) } : {}),
  });

  await activityLogService.log({
    req,
    action: "Updated resident record",
    module: "RESIDENTS",
    description: `${resident.firstName} ${resident.lastName}`,
  });

  return resident;
}

async function remove(id: string, req: Request) {
  const existing = await residentRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Resident not found");
  }
  if (existing.householdId) {
    throw ApiError.conflict("Remove this resident from their household before deleting the record");
  }

  await residentRepository.softDelete(id);
  await activityLogService.log({
    req,
    action: "Deleted resident record",
    module: "RESIDENTS",
    description: `${existing.firstName} ${existing.lastName}`,
  });
}

async function assignTags(
  id: string,
  tags: { tagType: string; remarks?: string; effectiveDate?: string; expiryDate?: string }[],
  req: Request,
) {
  const existing = await residentRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Resident not found");
  }

  const resident = await residentRepository.replaceTags(
    id,
    tags.map((t) => ({
      tagType: t.tagType,
      remarks: t.remarks,
      effectiveDate: t.effectiveDate ? new Date(t.effectiveDate) : undefined,
      expiryDate: t.expiryDate ? new Date(t.expiryDate) : undefined,
    })),
    req.user!.id,
  );

  await activityLogService.log({
    req,
    action: "Updated resident tags",
    module: "RESIDENTS",
    description: `${resident.firstName} ${resident.lastName}: ${tags.map((t) => t.tagType).join(", ") || "none"}`,
  });

  return resident;
}

export const residentService = { list, getById, create, update, remove, assignTags };
