import { Request } from "express";
import { householdRepository, HouseholdListFilters } from "../repositories/household.repository";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface HouseholdInput {
  sitioId: string;
  purokId: string;
  street: string;
  houseNumber?: string;
  headResidentId: string;
  memberIds: string[];
  memberRelationships?: Record<string, string>;
  contactNumber: string;
  classification?: string;
  is4PsBeneficiary?: boolean;
}

async function list(req: Request, filters: Omit<HouseholdListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await householdRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const household = await householdRepository.findById(id);
  if (!household) {
    throw ApiError.notFound("Household not found");
  }
  return household;
}

async function create(input: HouseholdInput, req: Request) {
  if (!input.memberIds.includes(input.headResidentId)) {
    throw ApiError.badRequest("The household head must be included in the member list");
  }

  const household = await householdRepository.createWithMembers({
    sitioId: input.sitioId,
    purokId: input.purokId,
    street: input.street,
    houseNumber: input.houseNumber ?? "",
    contactNumber: input.contactNumber,
    classification: input.classification ?? "NOT_CLASSIFIED",
    is4PsBeneficiary: input.is4PsBeneficiary ?? false,
    headResidentId: input.headResidentId,
    memberIds: input.memberIds,
    memberRelationships: input.memberRelationships ?? {},
    createdById: req.user!.id,
  });

  await activityLogService.log({
    req,
    action: "Added new household record",
    module: "HOUSEHOLDS",
    description: household.householdNumber,
  });

  return household;
}

async function update(id: string, input: Partial<HouseholdInput>, req: Request) {
  const existing = await householdRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Household not found");
  }

  if (input.memberIds && input.headResidentId && !input.memberIds.includes(input.headResidentId)) {
    throw ApiError.badRequest("The household head must be included in the member list");
  }

  const household = await householdRepository.updateWithMembers(id, input);

  await activityLogService.log({
    req,
    action: "Updated household record",
    module: "HOUSEHOLDS",
    description: household.householdNumber,
  });

  return household;
}

async function archive(id: string, req: Request) {
  const existing = await householdRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Household not found");
  }
  const household = await householdRepository.setArchived(id, true);
  await activityLogService.log({
    req,
    action: "Archived household record",
    module: "HOUSEHOLDS",
    description: household.householdNumber,
  });
  return household;
}

async function restore(id: string, req: Request) {
  const existing = await householdRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Household not found");
  }
  const household = await householdRepository.setArchived(id, false);
  await activityLogService.log({
    req,
    action: "Restored household record",
    module: "HOUSEHOLDS",
    description: household.householdNumber,
  });
  return household;
}

async function remove(id: string, req: Request) {
  const existing = await householdRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Household not found");
  }
  await householdRepository.softDeleteWithUnlink(id);
  await activityLogService.log({
    req,
    action: "Deleted household record",
    module: "HOUSEHOLDS",
    description: existing.householdNumber,
  });
}

export const householdService = { list, getById, create, update, archive, restore, remove };
