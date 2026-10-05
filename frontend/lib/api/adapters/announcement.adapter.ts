import type { Announcement, AnnouncementCategory, AnnouncementStatus } from "@/types"

const CATEGORY_TO_BACKEND: Record<AnnouncementCategory, string> = {
  General: "GENERAL",
  Health: "HEALTH",
  Safety: "SAFETY",
  Event: "EVENT",
  Advisory: "ADVISORY",
  "Job Opening": "JOB_OPENING",
}
const CATEGORY_FROM_BACKEND: Record<string, AnnouncementCategory> = Object.fromEntries(
  Object.entries(CATEGORY_TO_BACKEND).map(([display, backend]) => [backend, display as AnnouncementCategory]),
)

const STATUS_TO_BACKEND: Record<AnnouncementStatus, string> = {
  Draft: "DRAFT",
  Scheduled: "SCHEDULED",
  Published: "PUBLISHED",
}
const STATUS_FROM_BACKEND: Record<string, AnnouncementStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([display, backend]) => [backend, display as AnnouncementStatus]),
)

interface BackendAnnouncement {
  id: string
  title: string
  content: string
  excerpt: string
  imageUrl?: string | null
  category: string
  isPinned: boolean
  status: string
  publishAt: string
  author?: { id: string; name: string } | null
  attachments: { id: string; name: string; url: string; mimeType: string; sizeKb: number; isMedia: boolean }[]
  createdAt: string
  updatedAt: string
}

export function toAnnouncementPayload(values: {
  title: string
  content: string
  category: AnnouncementCategory
  isPinned: boolean
  status: AnnouncementStatus
  publishAt: string
}) {
  return {
    title: values.title,
    content: values.content,
    category: CATEGORY_TO_BACKEND[values.category],
    isPinned: values.isPinned,
    status: STATUS_TO_BACKEND[values.status],
    publishAt: values.publishAt,
  }
}

export function fromAnnouncementDto(dto: BackendAnnouncement): Announcement {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    excerpt: dto.excerpt,
    imageUrl: dto.imageUrl ?? undefined,
    mediaUrls: dto.attachments.filter((a) => a.isMedia).map((a) => a.url),
    attachments: dto.attachments
      .filter((a) => !a.isMedia)
      .map((a) => ({ id: a.id, name: a.name, url: a.url, mimeType: a.mimeType, sizeKb: a.sizeKb })),
    category: CATEGORY_FROM_BACKEND[dto.category] ?? "General",
    isPinned: dto.isPinned,
    status: STATUS_FROM_BACKEND[dto.status] ?? "Draft",
    publishAt: dto.publishAt,
    author: dto.author?.name ?? "System",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
