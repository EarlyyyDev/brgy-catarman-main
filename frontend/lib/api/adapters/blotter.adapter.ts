import type { Blotter, BlotterFormValues, BlotterStatus, HearingStatus } from "@/types"
import type { StaffMember } from "@/types"

const STATUS_TO_BACKEND: Record<BlotterStatus, string> = {
  Open: "OPEN",
  "Under Mediation": "UNDER_MEDIATION",
  Settled: "SETTLED",
  "Escalated to Court": "ESCALATED_TO_COURT",
  Closed: "CLOSED",
  Archived: "ARCHIVED",
}
const STATUS_FROM_BACKEND: Record<string, BlotterStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([display, backend]) => [backend, display as BlotterStatus]),
)

const HEARING_STATUS_TO_BACKEND: Record<HearingStatus, string> = {
  Scheduled: "SCHEDULED",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
}
const HEARING_STATUS_FROM_BACKEND: Record<string, HearingStatus> = Object.fromEntries(
  Object.entries(HEARING_STATUS_TO_BACKEND).map(([display, backend]) => [backend, display as HearingStatus]),
)

interface BackendBlotter {
  id: string
  caseNumber: string
  incidentType: string
  complainantName: string
  complainantAddress: string
  complainantContact: string
  respondentName: string
  respondentAddress: string
  incidentDate: string
  location: string
  narrative: string
  status: string
  mediator?: { id: string; name: string } | null
  resolution?: string | null
  isArchived: boolean
  hearings: { id: string; date: string; notes?: string | null; status: string }[]
  history: { id: string; label: string; description?: string | null; actor?: string | null; timestamp: string }[]
  createdAt: string
  updatedAt: string
}

/** Mediator is a plain free-text input in the frontend form but a real User
 * FK on the backend — best-effort exact-name match against the staff
 * directory; if no match, the field is simply left unset server-side. */
export function mediatorIdByName(name: string | undefined, staff: StaffMember[]): string | undefined {
  if (!name?.trim()) return undefined
  return staff.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())?.id
}

export function toBlotterPayload(values: BlotterFormValues, staff: StaffMember[]) {
  return {
    incidentType: values.incidentType,
    complainantName: values.complainantName,
    complainantAddress: values.complainantAddress,
    complainantContact: values.complainantContact,
    respondentName: values.respondentName,
    respondentAddress: values.respondentAddress,
    incidentDate: values.incidentDate,
    location: values.location,
    narrative: values.narrative,
    mediatorId: mediatorIdByName(values.mediator, staff),
  }
}

export function fromBlotterDto(dto: BackendBlotter): Blotter {
  return {
    id: dto.id,
    caseNumber: dto.caseNumber,
    incidentType: dto.incidentType,
    complainantName: dto.complainantName,
    complainantAddress: dto.complainantAddress,
    complainantContact: dto.complainantContact,
    respondentName: dto.respondentName,
    respondentAddress: dto.respondentAddress,
    incidentDate: dto.incidentDate,
    location: dto.location,
    narrative: dto.narrative,
    status: STATUS_FROM_BACKEND[dto.status] ?? "Open",
    mediator: dto.mediator?.name ?? undefined,
    hearings: dto.hearings.map((h) => ({ id: h.id, date: h.date, notes: h.notes ?? undefined, status: HEARING_STATUS_FROM_BACKEND[h.status] ?? "Scheduled" })),
    resolution: dto.resolution ?? undefined,
    isArchived: dto.isArchived,
    history: dto.history.map((h) => ({ id: h.id, label: h.label, description: h.description ?? undefined, actor: h.actor ?? undefined, timestamp: h.timestamp })),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export { STATUS_TO_BACKEND as blotterStatusToBackend, HEARING_STATUS_TO_BACKEND as hearingStatusToBackend }
