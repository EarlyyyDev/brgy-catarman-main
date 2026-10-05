import { Request, Response } from "express";
import { complaintService } from "../services/complaint.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const listComplaints = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, category } = req.query as Record<string, string | undefined>;
  const result = await complaintService.list(req, { search, status, category });
  sendSuccess(res, result);
});

export const getComplaint = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const complaint = await complaintService.getById(req.params.id);
  sendSuccess(res, complaint);
});

export const trackComplaint = asyncHandler(async (req: Request<{ referenceNumber: string }>, res: Response) => {
  const complaint = await complaintService.trackByReference(req.params.referenceNumber);
  sendSuccess(res, complaint);
});

export const submitComplaint = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await complaintService.submit(req.body, req);
  sendSuccess(res, complaint, 201);
});

export const updateComplaintStatus = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { status, staffNotes } = req.body as {
    status: "NEW" | "UNDER_REVIEW" | "VALIDATED" | "RESOLVED" | "ARCHIVED" | "DISMISSED";
    staffNotes?: string;
  };
  const complaint = await complaintService.updateStatus(req.params.id, status, req, staffNotes);
  sendSuccess(res, complaint);
});

export const addComplaintPhoto = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  const { type, source, latitude, longitude } = req.body as {
    type: "REPORTER_CAPTURE" | "EVIDENCE";
    source: "LIVE_CAMERA" | "FILE_UPLOAD";
    latitude?: string;
    longitude?: string;
  };

  const photo = await complaintService.addPhoto(
    req.params.id,
    {
      type,
      source,
      photoUrl: publicUrlFor("complaints", req.file.filename),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      ipAddress: req.ip,
    },
    req,
  );
  sendSuccess(res, photo, 201);
});
