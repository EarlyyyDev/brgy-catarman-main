import type { CertificateRequest, CertificateRequestTrackResult, CertificateStatus, DocumentType } from "@/types"
import type { BackendDocumentType } from "@/lib/api/hooks/use-document-types"

const STATUS_TO_BACKEND: Record<CertificateStatus, string> = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Approved: "APPROVED",
  Rejected: "REJECTED",
  "Ready for Claim": "READY_FOR_CLAIM",
  Claimed: "CLAIMED",
}
const STATUS_FROM_BACKEND: Record<string, CertificateStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([display, backend]) => [backend, display as CertificateStatus]),
)

interface BackendCertificateRequest {
  id: string
  referenceNumber: string
  controlNumber?: string | null
  documentType?: { id: string; name: string }
  otherDocumentLabel?: string | null
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  residentId?: string | null
  residentPhotoUrl?: string | null
  channel: "ONLINE" | "WALK_IN"
  status: string
  staffNotes?: string | null
  rejectionReason?: string | null
  processedBy?: { id: string; name: string } | null
  authorizationLetterUrl?: string | null
  representativeIdUrl?: string | null
  submittedAt: string
  reviewedAt?: string | null
  approvedAt?: string | null
  claimDeadline?: string | null
  claimedAt?: string | null
  requirements: { id: string; name: string; url: string; sizeKb: number; mimeType: string; uploadedAt: string }[]
  timeline: { id: string; label: string; description?: string | null; actor?: string | null; timestamp: string }[]
  batch?: { referenceNumber: string } | null
}

interface BackendCertificateRequestBatch {
  referenceNumber: string
  requestorName: string
  submittedAt: string
  requests: BackendCertificateRequest[]
}

export function documentTypeIdByRequestName(name: DocumentType, documentTypes: BackendDocumentType[]): string | undefined {
  return documentTypes.find((d) => d.name === name)?.id
}

/** Public multi-select submission -- one form fills out shared info once and
 * requests any number of document types together under one batch. */
export function toPublicBatchRequestPayload(values: {
  documentTypes: DocumentType[]
  otherDocumentLabel?: string
  requestorName?: string
  isRepresentative: boolean
  captchaToken: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  residentId: string
}, documentTypes: BackendDocumentType[]) {
  return {
    documentTypeIds: values.documentTypes
      .map((name) => documentTypeIdByRequestName(name, documentTypes))
      .filter((id): id is string => Boolean(id)),
    otherDocumentLabel: values.otherDocumentLabel || undefined,
    requestorName: values.requestorName || undefined,
    isRepresentative: values.isRepresentative,
    captchaToken: values.captchaToken,
    address: values.address,
    contactNumber: values.contactNumber,
    email: values.email,
    purpose: values.purpose,
    residentId: values.residentId,
  }
}

export function toPublicRequestPayload(values: {
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  residentId?: string
}, documentTypes: BackendDocumentType[]) {
  return {
    documentTypeId: documentTypeIdByRequestName(values.documentType, documentTypes),
    otherDocumentLabel: values.otherDocumentLabel || undefined,
    requestorName: values.requestorName,
    address: values.address,
    contactNumber: values.contactNumber,
    email: values.email,
    purpose: values.purpose,
    residentId: values.residentId || undefined,
  }
}

export function toWalkInRequestPayload(values: {
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  residentId?: string
  residentPhotoUrl?: string
  authorizationLetterUrl?: string
  representativeIdUrl?: string
}, documentTypes: BackendDocumentType[]) {
  return {
    ...toPublicRequestPayload(values, documentTypes),
    residentPhotoUrl: values.residentPhotoUrl || undefined,
    authorizationLetterUrl: values.authorizationLetterUrl || undefined,
    representativeIdUrl: values.representativeIdUrl || undefined,
  }
}

export function fromCertificateRequestDto(dto: BackendCertificateRequest): CertificateRequest {
  return {
    id: dto.id,
    referenceNumber: dto.referenceNumber,
    batchReferenceNumber: dto.batch?.referenceNumber ?? undefined,
    controlNumber: dto.controlNumber ?? undefined,
    documentType: (dto.documentType?.name ?? "Other Barangay Document") as DocumentType,
    otherDocumentLabel: dto.otherDocumentLabel ?? undefined,
    requestorName: dto.requestorName,
    address: dto.address,
    contactNumber: dto.contactNumber,
    email: dto.email,
    purpose: dto.purpose,
    requirements: dto.requirements.map((r) => ({ id: r.id, name: r.name, url: r.url, sizeKb: r.sizeKb, mimeType: r.mimeType, uploadedAt: r.uploadedAt })),
    residentId: dto.residentId ?? undefined,
    residentPhotoUrl: dto.residentPhotoUrl ?? undefined,
    channel: dto.channel === "ONLINE" ? "Online" : "Walk-in",
    status: STATUS_FROM_BACKEND[dto.status] ?? "Pending",
    staffNotes: dto.staffNotes ?? undefined,
    rejectionReason: dto.rejectionReason ?? undefined,
    processedBy: dto.processedBy?.name ?? undefined,
    submittedAt: dto.submittedAt,
    reviewedAt: dto.reviewedAt ?? undefined,
    approvedAt: dto.approvedAt ?? undefined,
    claimDeadline: dto.claimDeadline ?? undefined,
    claimedAt: dto.claimedAt ?? undefined,
    timeline: dto.timeline.map((t) => ({ id: t.id, label: t.label, description: t.description ?? undefined, actor: t.actor ?? undefined, timestamp: t.timestamp })),
    authorizationLetter: dto.authorizationLetterUrl
      ? { id: `${dto.id}-auth-letter`, name: "Authorization Letter", url: dto.authorizationLetterUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: dto.submittedAt }
      : undefined,
    representativeIdUrl: dto.representativeIdUrl ?? undefined,
  }
}

export function fromCertificateRequestBatchDto(dto: BackendCertificateRequestBatch): CertificateRequestTrackResult {
  return {
    referenceNumber: dto.referenceNumber,
    requestorName: dto.requestorName,
    submittedAt: dto.submittedAt,
    requests: dto.requests.map(fromCertificateRequestDto),
  }
}

export { STATUS_TO_BACKEND as certificateStatusToBackend }
