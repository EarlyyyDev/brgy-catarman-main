import type { ActivityLog, AppNotification } from "@/types"

interface BackendActivityLog {
  id: string
  actorId: string | null
  actorName: string
  actorRole: "STAFF" | "ADMINISTRATOR" | "SYSTEM"
  action: string
  module:
    | "AUTHENTICATION"
    | "RESIDENTS"
    | "HOUSEHOLDS"
    | "CERTIFICATES"
    | "COMPLAINTS"
    | "BLOTTERS"
    | "ANNOUNCEMENTS"
    | "SETTINGS"
    | "BACKUP"
    | "STAFF"
  description: string | null
  ipAddress: string | null
  browser: string | null
  status: "SUCCESS" | "FAILED"
  timestamp: string
}

interface BackendNotification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  isRead: boolean
  link: string | null
  createdAt: string
}

const ACTOR_ROLE_FROM_BACKEND: Record<BackendActivityLog["actorRole"], ActivityLog["actorRole"]> = {
  STAFF: "Staff",
  ADMINISTRATOR: "Administrator",
  SYSTEM: "System",
}

const MODULE_FROM_BACKEND: Record<BackendActivityLog["module"], ActivityLog["module"]> = {
  AUTHENTICATION: "Authentication",
  RESIDENTS: "Residents",
  HOUSEHOLDS: "Households",
  CERTIFICATES: "Certificates",
  COMPLAINTS: "Complaints",
  BLOTTERS: "Blotters",
  ANNOUNCEMENTS: "Announcements",
  SETTINGS: "Settings",
  BACKUP: "Backup",
  STAFF: "Staff",
}

const STATUS_FROM_BACKEND: Record<BackendActivityLog["status"], ActivityLog["status"]> = {
  SUCCESS: "Success",
  FAILED: "Failed",
}

const NOTIFICATION_TYPE_FROM_BACKEND: Record<BackendNotification["type"], AppNotification["type"]> = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
}

export function fromActivityLogDto(dto: BackendActivityLog): ActivityLog {
  return {
    id: dto.id,
    actorName: dto.actorName,
    actorRole: ACTOR_ROLE_FROM_BACKEND[dto.actorRole],
    action: dto.action,
    module: MODULE_FROM_BACKEND[dto.module],
    description: dto.description ?? "",
    ipAddress: dto.ipAddress ?? "",
    browser: dto.browser ?? "",
    status: STATUS_FROM_BACKEND[dto.status],
    timestamp: dto.timestamp,
  }
}

export function fromNotificationDto(dto: BackendNotification): AppNotification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    type: NOTIFICATION_TYPE_FROM_BACKEND[dto.type],
    isRead: dto.isRead,
    link: dto.link ?? undefined,
    createdAt: dto.createdAt,
  }
}
