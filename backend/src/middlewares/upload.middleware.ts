import { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  CloudinaryConfigurationError,
  CloudinaryUploadError,
} from "../config/cloudinary";
import { UploadSubdir, createUploader } from "../config/uploads";
import { sendError } from "../utils/apiResponse.util";

function handleUploadError(res: Response, error: unknown) {
  if (error instanceof multer.MulterError) {
    sendError(res, 400, `Upload error: ${error.message}`);
    return;
  }
  if (error instanceof CloudinaryConfigurationError) {
    sendError(res, 503, error.message);
    return;
  }
  if (error instanceof CloudinaryUploadError) {
    console.error(error.message);
    sendError(res, 502, error.message);
    return;
  }
  const message = error instanceof Error ? error.message : "Upload failed";
  sendError(res, 400, message);
}

/** Parses one multipart file and streams it to Cloudinary. */
export function uploadSingle(subdir: UploadSubdir, fieldName: string, maxSizeMb?: number) {
  const uploader = createUploader(subdir, maxSizeMb).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      handleUploadError(res, err);
    });
  };
}

/** Parses multipart files and streams them to Cloudinary. */
export function uploadMultiple(subdir: UploadSubdir, fieldName: string, maxCount = 10) {
  const uploader = createUploader(subdir).array(fieldName, maxCount);

  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      handleUploadError(res, err);
    });
  };
}
