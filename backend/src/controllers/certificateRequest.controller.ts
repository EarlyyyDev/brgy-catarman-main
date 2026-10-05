import { Request, Response } from "express";
import { certificateRequestService } from "../services/certificateRequest.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const listCertificateRequests = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, documentTypeId, channel } = req.query as Record<string, string | undefined>;
  const result = await certificateRequestService.list(req, { search, status, documentTypeId, channel });
  sendSuccess(res, result);
});

export const getCertificateRequest = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const request = await certificateRequestService.getById(req.params.id);
  sendSuccess(res, request);
});

export const trackCertificateRequest = asyncHandler(async (req: Request<{ referenceNumber: string }>, res: Response) => {
  const request = await certificateRequestService.trackByReference(req.params.referenceNumber);
  sendSuccess(res, request);
});

export const submitPublicCertificateRequest = asyncHandler(async (req: Request, res: Response) => {
  const batch = await certificateRequestService.submitPublicBatchRequest(req.body, req);
  sendSuccess(res, batch, 201);
});

export const submitWalkInCertificateRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await certificateRequestService.submitWalkInRequest(req.body, req);
  sendSuccess(res, request, 201);
});

export const updateCertificateStatus = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { status, rejectionReason, staffNotes, extendDays, claimedBy } = req.body as {
    status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "READY_FOR_CLAIM" | "CLAIMED";
    rejectionReason?: string;
    staffNotes?: string;
    extendDays?: number;
    claimedBy?: string;
  };
  const request = await certificateRequestService.updateStatus(req.params.id, status, req, {
    rejectionReason,
    staffNotes,
    extendDays,
    claimedBy,
  });
  sendSuccess(res, request);
});

export const deleteCertificateRequest = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await certificateRequestService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const uploadCertificateRequirement = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  const requirement = await certificateRequestService.addRequirement(
    req.params.id,
    {
      name: req.file.originalname,
      url: publicUrlFor("certificates", req.file.filename),
      sizeKb: Math.round(req.file.size / 1024),
      mimeType: req.file.mimetype,
    },
    req,
  );
  sendSuccess(res, requirement, 201);
});
