import { Request } from "express";
import { complaintRepository, ComplaintListFilters } from "../repositories/complaint.repository";
import { prisma } from "../config/prisma";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";
import { notificationRepository } from "../repositories/notification.repository";
import { sendComplaintStatusEmail, sendComplaintSubmittedEmail } from "../utils/residentEmail.util";
import { verifyRecaptchaToken } from "../utils/recaptcha.util";

export interface ComplaintInput {
  captchaToken: string;
  residentId: string;
  reporterPhone: string;
  reporterEmail: string;
  reportedPerson?: string;
  category:
    | "LOITERING"
    | "NOISE_COMPLAINT"
    | "ILLEGAL_PARKING"
    | "PUBLIC_DISTURBANCE"
    | "ILLEGAL_DUMPING"
    | "VANDALISM"
    | "OTHER";
  otherCategoryLabel?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  incidentDate: string;
  incidentTime: string;
  description: string;
}

async function list(req: Request, filters: Omit<ComplaintListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await complaintRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const complaint = await complaintRepository.findById(id);
  if (!complaint) {
    throw ApiError.notFound("Complaint not found");
  }
  return complaint;
}

async function trackByReference(referenceNumber: string) {
  const complaint = await complaintRepository.findByReferenceNumber(referenceNumber);
  if (!complaint) {
    throw ApiError.notFound("No report found with that reference number");
  }
  return complaint;
}

async function submit(input: ComplaintInput, req: Request) {
  const { captchaToken, residentId, ...complaintInput } = input;
  await verifyRecaptchaToken(captchaToken, req.ip);
  const resident = await prisma.resident.findFirst({ where: { id: residentId, deletedAt: null } });
  if (!resident) {
    throw ApiError.badRequest("We couldn't find that resident record. Please select your name from the list.");
  }
  const reporterName = [resident.firstName, resident.middleName, resident.lastName, resident.suffix]
    .filter(Boolean)
    .join(" ");

  const complaint = await complaintRepository.create({
    ...complaintInput,
    resident: { connect: { id: resident.id } },
    reporterName,
    incidentDate: new Date(complaintInput.incidentDate),
    isConfidential: true,
    status: "NEW",
  });

  await activityLogService.log({
    req,
    action: "New incident report submitted",
    module: "COMPLAINTS",
    description: complaint.referenceNumber,
  });

  // Reporter identity stays out of the notification text -- complaints are
  // confidential by design, and staff can see full details via the link.
  await notificationRepository.create({
    title: "New Incident Report",
    message: `A new incident report was submitted (Ref: ${complaint.referenceNumber})`,
    type: "WARNING",
    link: "/dashboard/complaints",
  });

  await sendComplaintSubmittedEmail({
    email: complaint.reporterEmail,
    reporterName: complaint.reporterName,
    referenceNumber: complaint.referenceNumber,
  });

  return complaint;
}

async function updateStatus(
  id: string,
  status: "NEW" | "UNDER_REVIEW" | "VALIDATED" | "RESOLVED" | "ARCHIVED" | "DISMISSED",
  req: Request,
  staffNotes?: string,
) {
  const existing = await complaintRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Complaint not found");
  }

  const data: Record<string, unknown> = { status };
  if (staffNotes !== undefined) {
    data.staffNotes = staffNotes;
  }
  if (status === "RESOLVED") {
    data.resolvedAt = new Date();
  }

  const complaint = await complaintRepository.updateStatus(id, data, {
    label: `Status changed to ${status.replace(/_/g, " ")}`,
    actor: req.user!.name,
  });

  await activityLogService.log({
    req,
    action: `Complaint marked as ${status.toLowerCase().replace(/_/g, " ")}`,
    module: "COMPLAINTS",
    description: complaint.referenceNumber,
  });

  await sendComplaintStatusEmail({
    email: complaint.reporterEmail,
    reporterName: complaint.reporterName,
    referenceNumber: complaint.referenceNumber,
    status: complaint.status,
  });

  return complaint;
}

async function addPhoto(
  id: string,
  photo: {
    type: "REPORTER_CAPTURE" | "EVIDENCE";
    source: "LIVE_CAMERA" | "FILE_UPLOAD";
    photoUrl: string;
    latitude?: number;
    longitude?: number;
    ipAddress?: string;
  },
  req: Request,
) {
  await getById(id);

  const created = await complaintRepository.addPhoto(id, {
    ...photo,
    deviceInfo: req.headers["user-agent"],
  });

  if (photo.type === "REPORTER_CAPTURE") {
    await complaintRepository.setReporterPhoto(id, photo.photoUrl);
  }

  await activityLogService.log({
    req,
    action: photo.type === "REPORTER_CAPTURE" ? "Reporter verification photo captured" : "Evidence photo added",
    module: "COMPLAINTS",
    description: id,
  });

  return created;
}

export const complaintService = { list, getById, trackByReference, submit, updateStatus, addPhoto };
