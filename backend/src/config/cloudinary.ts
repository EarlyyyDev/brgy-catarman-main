import { randomUUID } from "crypto";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import type { UploadSubdir } from "./uploads";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryConfigurationError extends Error {
  constructor() {
    super(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
    this.name = "CloudinaryConfigurationError";
  }
}

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

export function createCloudinaryStorage(subdir: UploadSubdir): multer.StorageEngine {
  return {
    _handleFile(_req, file, callback) {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        callback(new CloudinaryConfigurationError());
        return;
      }

      let settled = false;
      const complete = (error: Error | null, info?: Record<string, unknown>) => {
        if (settled) return;
        settled = true;
        callback(error, info);
      };

      const cloudinaryStream = cloudinary.uploader.upload_stream(
        {
          folder: `brgy-catarman/${subdir}`,
          public_id: randomUUID(),
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            complete(new CloudinaryUploadError("Cloudinary upload failed."));
            return;
          }
          if (!result) {
            complete(new CloudinaryUploadError("Cloudinary returned no upload result."));
            return;
          }
          complete(null, {
            filename: result.public_id,
            path: result.secure_url,
            size: result.bytes,
          });
        },
      );

      cloudinaryStream.on("error", () => {
        complete(new CloudinaryUploadError("Cloudinary upload failed."));
      });
      file.stream.on("error", (error: Error) => cloudinaryStream.destroy(error));
      file.stream.pipe(cloudinaryStream);
    },
    _removeFile(_req, file, callback) {
      const publicId = file.filename;
      if (!publicId) {
        callback(null);
        return;
      }

      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : file.mimetype.startsWith("image/")
          ? "image"
          : "raw";
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error) => {
        if (error) {
          callback(new CloudinaryUploadError("Unable to remove the uploaded Cloudinary file."));
          return;
        }
        callback(null);
      });
    },
  };
}
