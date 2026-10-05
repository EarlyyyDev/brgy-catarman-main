import fs from "fs";
import path from "path";
import { Request } from "express";
import { ActivityModule, ActivityStatus, Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { backupRepository } from "../repositories/backup.repository";
import { activityLogService } from "./activityLog.service";
import { ApiError } from "../utils/apiError.util";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";

export const BACKUP_DIR = path.join(process.cwd(), "backups");
const BACKUP_FORMAT_VERSION = 1;

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Every substantive data table, in FK-safe dependency order (parents before
 * children) for restore inserts. Session/RefreshToken are deliberately
 * excluded — restoring stale auth tokens is meaningless and a security risk.
 * BackupRecord itself is excluded to avoid a backup containing its own history.
 * Resident/Household are mutually referential (Resident.householdId <->
 * Household.headResidentId), so householdId is stripped from the resident
 * insert pass and patched back on afterward — see restoreBackup.
 */
const BACKUP_MODELS = [
  "user",
  "sitio",
  "purok",
  "resident",
  "residentTag",
  "household",
  "documentType",
  "certificateTemplate",
  "certificateRequest",
  "certificateRequirement",
  "certificateTimelineEvent",
  "complaint",
  "complaintTimelineEvent",
  "incidentPhoto",
  "blotterTemplate",
  "blotter",
  "blotterHearing",
  "blotterHistoryEvent",
  "announcement",
  "announcementAttachment",
  "comment",
  "commentReply",
  "reaction",
  "official",
  "emergencyContact",
  "activity",
  "systemSettings",
  "activityLog",
  "notification",
  "referenceNumber",
] as const;

type BackupModel = (typeof BACKUP_MODELS)[number];
type BackupPayload = { version: number; exportedAt: string; data: Record<BackupModel, unknown[]> };

function delegate(model: BackupModel) {
  return (prisma as unknown as Record<BackupModel, { findMany: (args?: unknown) => Promise<unknown[]> }>)[model];
}

async function runManualBackup(req: Request) {
  const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    const data = {} as Record<BackupModel, unknown[]>;
    for (const model of BACKUP_MODELS) {
      data[model] = await delegate(model).findMany();
    }

    const payload: BackupPayload = { version: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString(), data };
    fs.writeFileSync(filePath, JSON.stringify(payload, jsonReplacer));

    const sizeMb = new Prisma.Decimal(fs.statSync(filePath).size / (1024 * 1024)).toDecimalPlaces(2);

    const record = await backupRepository.create({
      fileName,
      sizeMb,
      type: "MANUAL",
      status: "COMPLETED",
      triggeredById: req.user?.id ?? null,
    });

    await activityLogService.log({
      req,
      action: "Created manual backup",
      module: ActivityModule.BACKUP,
      description: fileName,
    });

    return record;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await activityLogService.log({
      req,
      action: "Backup failed",
      module: ActivityModule.BACKUP,
      description: error instanceof Error ? error.message : "Unknown error",
      status: ActivityStatus.FAILED,
    });
    throw ApiError.internal("Backup failed. See activity log for details.");
  }
}

async function listBackups(req: Request) {
  const params = parsePagination(req);
  const [items, total] = await Promise.all([
    backupRepository.list({ skip: params.skip, take: params.take }),
    backupRepository.count(),
  ]);
  return toPaginationResult(items, total, params);
}

async function getBackupFile(id: string) {
  const record = await backupRepository.findById(id);
  if (!record) throw ApiError.notFound("Backup not found");

  const filePath = path.join(BACKUP_DIR, record.fileName);
  if (!fs.existsSync(filePath)) throw ApiError.notFound("Backup file is missing from disk");

  return { record, filePath };
}

/**
 * Wipes and re-populates every table in BACKUP_MODELS from a prior export,
 * inside one long transaction so a partial failure can't leave the database
 * half-restored. Deletion runs in reverse dependency order; insertion runs
 * in forward dependency order, with Resident/Household's circular FK broken
 * by inserting residents without householdId first, then patching it in
 * after households exist.
 */
async function restoreBackup(id: string, req: Request) {
  const { filePath } = await getBackupFile(id);
  const raw = fs.readFileSync(filePath, "utf-8");

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw ApiError.badRequest("Backup file is corrupted and cannot be parsed");
  }
  if (!payload?.data || typeof payload.version !== "number") {
    throw ApiError.badRequest("Backup file has an unrecognized format");
  }

  await prisma.$transaction(async (tx) => {
    const txDelegate = (model: BackupModel) =>
      (tx as unknown as Record<BackupModel, { deleteMany: () => Promise<unknown>; createMany: (args: { data: unknown[] }) => Promise<unknown> }>)[
        model
      ];

    for (const model of [...BACKUP_MODELS].reverse()) {
      await txDelegate(model).deleteMany();
    }

    for (const model of BACKUP_MODELS) {
      const rows = (payload.data[model] ?? []) as Array<Record<string, unknown>>;
      if (rows.length === 0) continue;

      if (model === "resident") {
        await txDelegate(model).createMany({ data: rows.map((row) => ({ ...row, householdId: null })) });
        continue;
      }

      await txDelegate(model).createMany({ data: rows });
    }

    const residentRows = (payload.data.resident ?? []) as Array<{ id: string; householdId?: string | null }>;
    for (const row of residentRows) {
      if (row.householdId) {
        await tx.resident.update({ where: { id: row.id }, data: { householdId: row.householdId } });
      }
    }
  }, LONG_TRANSACTION_OPTIONS);

  await activityLogService.log({
    req,
    action: "Restored backup",
    module: ActivityModule.BACKUP,
    description: filePath,
  });
}

async function deleteBackup(id: string, req: Request) {
  const record = await backupRepository.findById(id);
  if (!record) throw ApiError.notFound("Backup not found");

  const filePath = path.join(BACKUP_DIR, record.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await backupRepository.delete(id);

  await activityLogService.log({
    req,
    action: "Deleted backup",
    module: ActivityModule.BACKUP,
    description: record.fileName,
  });
}

/** JSON.stringify replacer so Prisma Decimal fields serialize as plain numbers, not {"s":1,"e":0,"d":[...]}. */
function jsonReplacer(_key: string, value: unknown) {
  if (value && typeof value === "object" && "toDecimalPlaces" in value) {
    return (value as Prisma.Decimal).toString();
  }
  return value;
}

export const backupService = { runManualBackup, listBackups, getBackupFile, restoreBackup, deleteBackup };
