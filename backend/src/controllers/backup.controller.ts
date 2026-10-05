import { Request, Response } from "express";
import { backupService } from "../services/backup.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listBackups = asyncHandler(async (req: Request, res: Response) => {
  const result = await backupService.listBackups(req);
  sendSuccess(res, result);
});

export const createBackup = asyncHandler(async (req: Request, res: Response) => {
  const record = await backupService.runManualBackup(req);
  sendSuccess(res, record, 201);
});

export const downloadBackup = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { record, filePath } = await backupService.getBackupFile(req.params.id);
  res.download(filePath, record.fileName);
});

export const restoreBackup = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await backupService.restoreBackup(req.params.id, req);
  sendSuccess(res, { message: "Backup restored successfully." });
});

export const deleteBackup = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await backupService.deleteBackup(req.params.id, req);
  sendSuccess(res, { message: "Backup deleted." });
});
