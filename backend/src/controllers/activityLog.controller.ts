import { Request, Response } from "express";
import { ActivityModule } from "@prisma/client";
import { activityLogRepository } from "../repositories/activityLog.repository";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";

export const listActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const params = parsePagination(req);
  const module =
    typeof req.query.module === "string" && req.query.module in ActivityModule
      ? (req.query.module as ActivityModule)
      : undefined;
  const actorId = typeof req.query.actorId === "string" ? req.query.actorId : undefined;

  const [items, total] = await Promise.all([
    activityLogRepository.list({ module, actorId, skip: params.skip, take: params.take }),
    activityLogRepository.count({ module, actorId }),
  ]);

  const result = toPaginationResult(items, total, params);
  sendSuccess(res, result);
});
