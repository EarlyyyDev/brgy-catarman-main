import type { EmergencyContact, Official } from "@/types"

const CATEGORY_FROM_BACKEND: Record<string, EmergencyContact["category"]> = {
  POLICE: "Police",
  FIRE: "Fire",
  MEDICAL: "Medical",
  DISASTER_RESPONSE: "Disaster Response",
  BARANGAY_HOTLINE: "Barangay Hotline",
  OTHER: "Other",
}

const CATEGORY_TO_BACKEND: Record<EmergencyContact["category"], string> = {
  Police: "POLICE",
  Fire: "FIRE",
  Medical: "MEDICAL",
  "Disaster Response": "DISASTER_RESPONSE",
  "Barangay Hotline": "BARANGAY_HOTLINE",
  Other: "OTHER",
}

interface BackendOfficial {
  id: string
  name: string
  position: string
  committee?: string | null
  photoUrl?: string | null
  order: number
  termStart: string
  termEnd: string
  contactNumber?: string | null
  email?: string | null
}

interface BackendEmergencyContact {
  id: string
  name: string
  category: string
  contactNumber: string
  address?: string | null
  availability: string
}

export function toOfficial(o: BackendOfficial): Official {
  return {
    id: o.id,
    name: o.name,
    position: o.position,
    committee: o.committee ?? undefined,
    photoUrl: o.photoUrl ?? "",
    order: o.order,
    termStart: o.termStart,
    termEnd: o.termEnd,
    contactNumber: o.contactNumber ?? undefined,
    email: o.email ?? undefined,
  }
}

export function officialToPayload(values: Omit<Official, "id">) {
  return {
    name: values.name,
    position: values.position,
    committee: values.committee || undefined,
    photoUrl: values.photoUrl || undefined,
    order: values.order,
    termStart: values.termStart,
    termEnd: values.termEnd,
    contactNumber: values.contactNumber || undefined,
    email: values.email || undefined,
  }
}

export function toEmergencyContact(c: BackendEmergencyContact): EmergencyContact {
  return {
    id: c.id,
    name: c.name,
    category: CATEGORY_FROM_BACKEND[c.category] ?? "Other",
    contactNumber: c.contactNumber,
    address: c.address ?? undefined,
    availability: c.availability,
  }
}

export function emergencyContactToPayload(values: Omit<EmergencyContact, "id">) {
  return {
    name: values.name,
    category: CATEGORY_TO_BACKEND[values.category],
    contactNumber: values.contactNumber,
    address: values.address || undefined,
    availability: values.availability,
  }
}
