import { Request } from "express";
import { blotterRepository, BlotterListFilters } from "../repositories/blotter.repository";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface BlotterInput {
  incidentType: string;
  complainantName: string;
  complainantAddress: string;
  complainantContact: string;
  respondentName: string;
  respondentAddress: string;
  incidentDate: string;
  location: string;
  narrative: string;
  mediatorId?: string;
}

async function list(req: Request, filters: Omit<BlotterListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await blotterRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const blotter = await blotterRepository.findById(id);
  if (!blotter) {
    throw ApiError.notFound("Blotter case not found");
  }
  return blotter;
}

async function create(input: BlotterInput, req: Request) {
  const blotter = await blotterRepository.create({
    ...input,
    incidentDate: new Date(input.incidentDate),
  });

  await activityLogService.log({
    req,
    action: "Filed new blotter case",
    module: "BLOTTERS",
    description: blotter.caseNumber,
  });

  return blotter;
}

async function update(id: string, input: Partial<BlotterInput>, req: Request) {
  await getById(id);
  const blotter = await blotterRepository.update(
    id,
    { ...input, ...(input.incidentDate ? { incidentDate: new Date(input.incidentDate) } : {}) },
    { label: "Case details updated", actor: req.user!.name },
  );

  await activityLogService.log({
    req,
    action: "Updated blotter case",
    module: "BLOTTERS",
    description: blotter.caseNumber,
  });

  return blotter;
}

async function updateStatus(
  id: string,
  status: "OPEN" | "UNDER_MEDIATION" | "SETTLED" | "ESCALATED_TO_COURT" | "CLOSED" | "ARCHIVED",
  req: Request,
  resolution?: string,
) {
  await getById(id);
  const data: Record<string, unknown> = { status };
  if (resolution !== undefined) {
    data.resolution = resolution;
  }

  const blotter = await blotterRepository.update(id, data, {
    label: `Status changed to ${status.replace(/_/g, " ")}`,
    actor: req.user!.name,
  });

  await activityLogService.log({
    req,
    action: `Blotter case marked as ${status.toLowerCase().replace(/_/g, " ")}`,
    module: "BLOTTERS",
    description: blotter.caseNumber,
  });

  return blotter;
}

async function archive(id: string, req: Request) {
  await getById(id);
  const blotter = await blotterRepository.update(
    id,
    { isArchived: true, status: "ARCHIVED" },
    { label: "Case archived", actor: req.user!.name },
  );
  await activityLogService.log({ req, action: "Archived blotter case", module: "BLOTTERS", description: blotter.caseNumber });
  return blotter;
}

async function remove(id: string, req: Request) {
  const existing = await getById(id);
  await blotterRepository.softDelete(id);
  await activityLogService.log({ req, action: "Deleted blotter case", module: "BLOTTERS", description: existing.caseNumber });
}

async function addHearing(id: string, date: string, notes: string | undefined, req: Request) {
  await getById(id);
  const hearing = await blotterRepository.addHearing(id, new Date(date), notes);
  await blotterRepository.addHistoryEvent(id, `Hearing scheduled for ${date}`, req.user!.name);
  await activityLogService.log({ req, action: "Scheduled hearing", module: "BLOTTERS", description: id });
  return hearing;
}

async function updateHearingStatus(
  id: string,
  hearingId: string,
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED",
  req: Request,
) {
  await getById(id);
  const hearing = await blotterRepository.updateHearingStatus(hearingId, status);
  await blotterRepository.addHistoryEvent(id, `Hearing marked as ${status.toLowerCase()}`, req.user!.name);
  await activityLogService.log({ req, action: "Updated hearing status", module: "BLOTTERS", description: id });
  return hearing;
}

async function addCaseNote(id: string, note: string, req: Request) {
  await getById(id);
  await blotterRepository.addHistoryEvent(id, note, req.user!.name);
  await activityLogService.log({ req, action: "Added case note", module: "BLOTTERS", description: id });
  return getById(id);
}

export const blotterService = {
  list,
  getById,
  create,
  update,
  updateStatus,
  archive,
  remove,
  addHearing,
  updateHearingStatus,
  addCaseNote,
};
