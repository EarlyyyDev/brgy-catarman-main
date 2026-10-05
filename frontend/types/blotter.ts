import type { TimelineEvent } from "./common"

export type BlotterStatus = "Open" | "Under Mediation" | "Settled" | "Escalated to Court" | "Closed" | "Archived"

export type HearingStatus = "Scheduled" | "Completed" | "Cancelled"

export interface BlotterHearing {
  id: string
  date: string
  notes?: string
  status: HearingStatus
}

export interface Blotter {
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
  status: BlotterStatus
  mediator?: string
  hearings: BlotterHearing[]
  resolution?: string
  isArchived: boolean
  history: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface BlotterFormValues {
  incidentType: string
  complainantName: string
  complainantAddress: string
  complainantContact: string
  respondentName: string
  respondentAddress: string
  incidentDate: string
  location: string
  narrative: string
  mediator?: string
}
