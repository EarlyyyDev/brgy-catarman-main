import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

// Deliberately no local try/catch -- letting the raw Prisma error propagate
// to asyncHandler is what lets it retry a transient Neon cold-start failure
// (P1001/P2024) instead of immediately reporting the service as down. A
// local catch here would swallow the error before asyncHandler ever saw a
// rejected promise to retry.
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;
  sendSuccess(res, { status: "ok", database: "connected", timestamp: new Date().toISOString() });
});
