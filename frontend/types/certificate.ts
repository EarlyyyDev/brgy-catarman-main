import type { UploadedFile, TimelineEvent } from "./common"

export type DocumentType =
  | "Barangay Certificate"
  | "Barangay Clearance"
  | "Certificate of Residency"
  | "Certificate of Indigency"
  | "Business Clearance"
  | "Other Barangay Document"

export type CertificateStatus =
  | "Pending"
  | "Processing"
  | "Approved"
  | "Rejected"
  | "Ready for Claim"
  | "Claimed"

export type RequestChannel = "Online" | "Walk-in"

export interface CertificateRequest {
  id: string
  referenceNumber: string
  /** Set when this request was submitted together with others in one form
   * session (see CertificateRequestBatch) -- the reference number the
   * resident actually tracks by, shared across every document in that batch. */
  batchReferenceNumber?: string
  controlNumber?: string
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  requirements: UploadedFile[]
  residentId?: string
  residentPhotoUrl?: string
  channel: RequestChannel
  status: CertificateStatus
  staffNotes?: string
  rejectionReason?: string
  processedBy?: string
  submittedAt: string
  reviewedAt?: string
  approvedAt?: string
  claimDeadline?: string
  claimedAt?: string
  timeline: TimelineEvent[]
  authorizationLetter?: UploadedFile
  representativeIdUrl?: string
}

/** Result of tracking a reference number -- always a list of one or more
 * documents (a single request predating batching, or every document in a
 * multi-document batch), all sharing the one reference number the resident
 * typed in. */
export interface CertificateRequestTrackResult {
  referenceNumber: string
  requestorName: string
  submittedAt: string
  requests: CertificateRequest[]
}

export interface CertificateRequestFormValues {
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
}
