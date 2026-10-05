import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { UploadSubdir, createUploader } from "../config/multer";
import { sendError } from "../utils/apiResponse.util";

/** Wraps a multer single-file upload so failures become the standard error envelope. */
export function uploadSingle(subdir: UploadSubdir, fieldName: string, maxSizeMb?: number) {
  const uploader = createUploader(subdir, maxSizeMb).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        sendError(res, 400, `Upload error: ${err.message}`);
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed";
      sendError(res, 400, message);
    });
  };
}

/** Wraps a multer multi-file upload (e.g. certificate requirements, evidence photos). */
export function uploadMultiple(subdir: UploadSubdir, fieldName: string, maxCount = 10) {
  const uploader = createUploader(subdir).array(fieldName, maxCount);

  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        sendError(res, 400, `Upload error: ${err.message}`);
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed";
      sendError(res, 400, message);
    });
  };
}
