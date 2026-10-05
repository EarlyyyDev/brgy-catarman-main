import multer from "multer";
import { env } from "./env";
import { createCloudinaryStorage } from "./cloudinary";

export const UPLOAD_SUBDIRS = [
  "residents",
  "households",
  "certificates",
  "certificate-templates",
  "complaints",
  "blotter-templates",
  "announcements",
  "officials",
  "settings",
  "staff",
  "backup",
] as const;

export type UploadSubdir = (typeof UPLOAD_SUBDIRS)[number];

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

/** maxSizeMb overrides the app-wide default for routes that need larger files. */
export function createUploader(subdir: UploadSubdir, maxSizeMb?: number) {
  return multer({
    storage: createCloudinaryStorage(subdir),
    limits: { fileSize: (maxSizeMb ?? env.UPLOAD_MAX_FILE_SIZE_MB) * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new Error(`Unsupported file type: ${file.mimetype}`));
        return;
      }
      callback(null, true);
    },
  });
}
