import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "./env";

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
  // Images -- avif/heic/heif included since modern phone cameras (iPhone's
  // default camera format is HEIC) and screenshots commonly produce these.
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  // Documents -- matches what the announcement "Attach Files" dropzone's
  // accept attribute already advertises to users (DOCUMENT_ACCEPT in
  // announcement-form-dialog.tsx), which this allowlist previously didn't.
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function ensureUploadDirsExist() {
  for (const subdir of UPLOAD_SUBDIRS) {
    const dirPath = path.join(process.cwd(), env.UPLOAD_DIR, subdir);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
ensureUploadDirsExist();

/** maxSizeMb overrides the app-wide default (env.UPLOAD_MAX_FILE_SIZE_MB) for
 * routes that legitimately need much larger uploads (e.g. announcement video)
 * -- kept per-route rather than raising the global default, since several
 * upload endpoints (certificate requirements, complaint photos) are public
 * and unauthenticated, and shouldn't all be exposed to multi-GB uploads. */
export function createUploader(subdir: UploadSubdir, maxSizeMb?: number) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(process.cwd(), env.UPLOAD_DIR, subdir));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: (maxSizeMb ?? env.UPLOAD_MAX_FILE_SIZE_MB) * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
        return;
      }
      cb(null, true);
    },
  });
}

export function publicUrlFor(subdir: UploadSubdir, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}
