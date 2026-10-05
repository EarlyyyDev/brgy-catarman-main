import type { BackupRecord } from "@/types"

interface BackendBackupRecord {
  id: string
  fileName: string
  sizeMb: string | number
  type: "MANUAL" | "AUTOMATIC"
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS"
  triggeredBy?: { name: string } | null
  createdAt: string
}

const TYPE_FROM_BACKEND: Record<BackendBackupRecord["type"], BackupRecord["type"]> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
}

const STATUS_FROM_BACKEND: Record<BackendBackupRecord["status"], BackupRecord["status"]> = {
  COMPLETED: "Completed",
  FAILED: "Failed",
  IN_PROGRESS: "In Progress",
}

export function toBackupRecord(b: BackendBackupRecord): BackupRecord {
  return {
    id: b.id,
    fileName: b.fileName,
    sizeMb: typeof b.sizeMb === "string" ? Number(b.sizeMb) : b.sizeMb,
    type: TYPE_FROM_BACKEND[b.type],
    status: STATUS_FROM_BACKEND[b.status],
    createdBy: b.triggeredBy?.name ?? "System",
    createdAt: b.createdAt,
  }
}
