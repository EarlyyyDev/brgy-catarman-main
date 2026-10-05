import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { SAFE_USER_SELECT } from "../utils/prismaSelectors.util";

export interface AnnouncementListFilters {
  search?: string;
  status?: string;
  category?: string;
  skip: number;
  take: number;
}

const includeRelations = {
  author: { select: SAFE_USER_SELECT },
  attachments: true,
} satisfies Prisma.AnnouncementInclude;

function buildWhere(filters: AnnouncementListFilters): Prisma.AnnouncementWhereInput {
  return {
    deletedAt: null,
    status: filters.status as never,
    category: filters.category as never,
    ...(filters.search ? { title: { contains: filters.search, mode: "insensitive" } } : {}),
  };
}

export const announcementRepository = {
  async list(filters: AnnouncementListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: includeRelations,
        // publishAt is date-only precision (the "Publish Date" picker has no
        // time component, so same-day posts share an identical midnight
        // timestamp) -- createdAt as a tiebreaker ensures the most recently
        // created post of the day actually sorts first, instead of falling
        // back to arbitrary/insertion order among same-publishAt rows.
        orderBy: [{ isPinned: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.announcement.count({ where }),
    ]);
    return { items, total };
  },

  async listPublished(params: { skip: number; take: number }) {
    const where: Prisma.AnnouncementWhereInput = {
      deletedAt: null,
      status: "PUBLISHED",
      publishAt: { lte: new Date() },
    };
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: includeRelations,
        // publishAt is date-only precision (the "Publish Date" picker has no
        // time component, so same-day posts share an identical midnight
        // timestamp) -- createdAt as a tiebreaker ensures the most recently
        // created post of the day actually sorts first, instead of falling
        // back to arbitrary/insertion order among same-publishAt rows.
        orderBy: [{ isPinned: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
        skip: params.skip,
        take: params.take,
      }),
      prisma.announcement.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.announcement.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  create(
    data: Omit<Prisma.AnnouncementUncheckedCreateInput, "attachments">,
    attachments?: { name: string; url: string; mimeType: string; sizeKb: number; isMedia?: boolean }[],
  ) {
    return prisma.announcement.create({
      data: { ...data, ...(attachments?.length ? { attachments: { create: attachments } } : {}) },
      include: includeRelations,
    });
  },

  async update(
    id: string,
    data: Omit<Prisma.AnnouncementUncheckedUpdateInput, "attachments">,
    attachments?: { name: string; url: string; mimeType: string; sizeKb: number; isMedia?: boolean }[],
  ) {
    if (attachments) {
      await prisma.announcementAttachment.deleteMany({ where: { announcementId: id } });
    }
    return prisma.announcement.update({
      where: { id },
      data: { ...data, ...(attachments ? { attachments: { create: attachments } } : {}) },
      include: includeRelations,
    });
  },

  softDelete(id: string) {
    return prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  count() {
    return prisma.announcement.count({ where: { deletedAt: null, status: "PUBLISHED" } });
  },
};
