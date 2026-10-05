import type { TimelineEvent } from "./common"

export type IncidentCategory =
  | "Loitering"
  | "Noise Complaint"
  | "Illegal Parking"
  | "Public Disturbance"
  | "Illegal Dumping"
  | "Vandalism"
  | "Other"

export type ComplaintStatus = "New" | "Under Review" | "Validated" | "Resolved" | "Archived" | "Dismissed"

export interface Complaint {
  id: string
  referenceNumber: string
  category: IncidentCategory
  otherCategoryLabel?: string
  reporterName: string
  reporterPhone: string
  reporterEmail: string
  reportedPerson?: string
  location: string
  latitude?: number
  longitude?: number
  incidentDate: string
  incidentTime: string
  description: string
  reporterPhotoUrl: string
  evidenceUrls: string[]
  status: ComplaintStatus
  staffNotes?: string
  isConfidential: boolean
  submittedAt: string
  resolvedAt?: string
  timeline: TimelineEvent[]
}

export interface ComplaintFormValues {
  reporterName: string
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
}
