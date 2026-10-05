import { Request } from "express";
import { announcementRepository, AnnouncementListFilters } from "../repositories/announcement.repository";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { stripHtmlToExcerpt } from "../utils/html.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface AnnouncementAttachmentInput {
  name: string;
  url: string;
  mimeType: string;
  sizeKb: number;
  isMedia?: boolean;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  imageUrl?: string;
  category?: "GENERAL" | "HEALTH" | "SAFETY" | "EVENT" | "ADVISORY" | "JOB_OPENING";
  isPinned?: boolean;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishAt: string;
  attachments?: AnnouncementAttachmentInput[];
}

async function list(req: Request, filters: Omit<AnnouncementListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await announcementRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function listPublished(req: Request) {
  const pagination = parsePagination(req);
  const { items, total } = await announcementRepository.listPublished(pagination);
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const announcement = await announcementRepository.findById(id);
  if (!announcement) {
    throw ApiError.notFound("Announcement not found");
  }
  return announcement;
}

async function create(input: AnnouncementInput, req: Request) {
  const { attachments, ...rest } = input;
  const announcement = await announcementRepository.create(
    {
      ...rest,
      excerpt: stripHtmlToExcerpt(input.content),
      publishAt: new Date(input.publishAt),
      authorId: req.user!.id,
    },
    attachments,
  );

  await activityLogService.log({
    req,
    action: "Published new announcement",
    module: "ANNOUNCEMENTS",
    description: announcement.title,
  });

  return announcement;
}

async function update(id: string, input: Partial<AnnouncementInput>, req: Request) {
  await getById(id);
  const { attachments, ...rest } = input;

  const announcement = await announcementRepository.update(
    id,
    {
      ...rest,
      ...(input.content ? { excerpt: stripHtmlToExcerpt(input.content) } : {}),
      ...(input.publishAt ? { publishAt: new Date(input.publishAt) } : {}),
    },
    attachments,
  );

  await activityLogService.log({
    req,
    action: "Updated announcement",
    module: "ANNOUNCEMENTS",
    description: announcement.title,
  });

  return announcement;
}

async function togglePin(id: string, req: Request) {
  const existing = await getById(id);
  const announcement = await announcementRepository.update(id, { isPinned: !existing.isPinned });
  await activityLogService.log({
    req,
    action: announcement.isPinned ? "Pinned announcement" : "Unpinned announcement",
    module: "ANNOUNCEMENTS",
    description: announcement.title,
  });
  return announcement;
}

async function remove(id: string, req: Request) {
  const existing = await getById(id);
  await announcementRepository.softDelete(id);
  await activityLogService.log({
    req,
    action: "Deleted announcement",
    module: "ANNOUNCEMENTS",
    description: existing.title,
  });
}

export const announcementService = { list, listPublished, getById, create, update, togglePin, remove };
