import { Request, Response } from "express";
import { settingsService } from "../services/settings.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await settingsService.getFull());
});

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await settingsService.getPublic());
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await settingsService.update(req.body, req));
});

export const uploadSettingsImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  sendSuccess(res, { url: publicUrlFor("settings", req.file.filename) }, 201);
});

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.submitContactForm(req.body, req);
  sendSuccess(res, { message: "Your message has been sent. We'll get back to you soon." }, 201);
});
