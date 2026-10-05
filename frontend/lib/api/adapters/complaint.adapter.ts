import type { Complaint, ComplaintStatus, IncidentCategory } from "@/types"

const CATEGORY_TO_BACKEND: Record<IncidentCategory, string> = {
  Loitering: "LOITERING",
  "Noise Complaint": "NOISE_COMPLAINT",
  "Illegal Parking": "ILLEGAL_PARKING",
  "Public Disturbance": "PUBLIC_DISTURBANCE",
  "Illegal Dumping": "ILLEGAL_DUMPING",
  Vandalism: "VANDALISM",
  Other: "OTHER",
}
const CATEGORY_FROM_BACKEND: Record<string, IncidentCategory> = Object.fromEntries(
  Object.entries(CATEGORY_TO_BACKEND).map(([display, backend]) => [backend, display as IncidentCategory]),
)

const STATUS_TO_BACKEND: Record<ComplaintStatus, string> = {
  New: "NEW",
  "Under Review": "UNDER_REVIEW",
  Validated: "VALIDATED",
  Resolved: "RESOLVED",
  Archived: "ARCHIVED",
  Dismissed: "DISMISSED",
}
const STATUS_FROM_BACKEND: Record<string, ComplaintStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([display, backend]) => [backend, display as ComplaintStatus]),
)

interface BackendComplaint {
  id: string
  referenceNumber: string
  category: string
  otherCategoryLabel?: string | null
  reporterName: string
  reporterPhone: string
  reporterEmail: string
  reportedPerson?: string | null
  location: string
  latitude?: string | number | null
  longitude?: string | number | null
  incidentDate: string
  incidentTime: string
  description: string
  reporterPhotoUrl?: string | null
  status: string
  staffNotes?: string | null
  isConfidential: boolean
  submittedAt: string
  resolvedAt?: string | null
  timeline: { id: string; label: string; description?: string | null; actor?: string | null; timestamp: string }[]
  photos: { id: string; type: string; photoUrl: string }[]
}

export function toSubmitComplaintPayload(values: {
  reporterName: string
  residentId: string
  captchaToken: string
  reporterPhone: string
  reporterEmail: string
  reportedPerson?: string
  category: IncidentCategory
  otherCategoryLabel?: string
  location: string
  latitude?: number
  longitude?: number
  incidentDate: string
  incidentTime: string
  description: string
}) {
  return {
    reporterName: values.reporterName,
    residentId: values.residentId,
    captchaToken: values.captchaToken,
    reporterPhone: values.reporterPhone,
    reporterEmail: values.reporterEmail,
    reportedPerson: values.reportedPerson || undefined,
    category: CATEGORY_TO_BACKEND[values.category],
    otherCategoryLabel: values.otherCategoryLabel || undefined,
    location: values.location,
    latitude: values.latitude,
    longitude: values.longitude,
    incidentDate: values.incidentDate,
    incidentTime: values.incidentTime,
    description: values.description,
  }
}

export function fromComplaintDto(dto: BackendComplaint): Complaint {
  return {
    id: dto.id,
    referenceNumber: dto.referenceNumber,
    category: CATEGORY_FROM_BACKEND[dto.category] ?? "Other",
    otherCategoryLabel: dto.otherCategoryLabel ?? undefined,
    reporterName: dto.reporterName,
    reporterPhone: dto.reporterPhone,
    reporterEmail: dto.reporterEmail,
    reportedPerson: dto.reportedPerson ?? undefined,
    location: dto.location,
    latitude: dto.latitude !== undefined && dto.latitude !== null ? Number(dto.latitude) : undefined,
    longitude: dto.longitude !== undefined && dto.longitude !== null ? Number(dto.longitude) : undefined,
    incidentDate: dto.incidentDate,
    incidentTime: dto.incidentTime,
    description: dto.description,
    reporterPhotoUrl: dto.reporterPhotoUrl ?? "",
    evidenceUrls: dto.photos.filter((p) => p.type === "EVIDENCE").map((p) => p.photoUrl),
    status: STATUS_FROM_BACKEND[dto.status] ?? "New",
    staffNotes: dto.staffNotes ?? undefined,
    isConfidential: dto.isConfidential,
    submittedAt: dto.submittedAt,
    resolvedAt: dto.resolvedAt ?? undefined,
    timeline: dto.timeline.map((t) => ({ id: t.id, label: t.label, description: t.description ?? undefined, actor: t.actor ?? undefined, timestamp: t.timestamp })),
  }
}

export { STATUS_TO_BACKEND as complaintStatusToBackend }
