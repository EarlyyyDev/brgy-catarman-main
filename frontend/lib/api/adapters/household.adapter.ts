import type { Household, HouseholdFormValues } from "@/types"

const CLASSIFICATION_TO_BACKEND: Record<string, string> = {
  "NHTS Poor": "NHTS_POOR",
  "Low Income": "LOW_INCOME",
  "Middle Income": "MIDDLE_INCOME",
  "Not Classified": "NOT_CLASSIFIED",
}
const CLASSIFICATION_FROM_BACKEND: Record<string, Household["classification"]> = {
  NHTS_POOR: "NHTS Poor",
  LOW_INCOME: "Low Income",
  MIDDLE_INCOME: "Middle Income",
  NOT_CLASSIFIED: "Not Classified",
}

interface BackendHousehold {
  id: string
  householdNumber: string
  sitioId: string
  purokId: string
  street: string
  houseNumber: string
  headResidentId?: string | null
  members: { id: string }[]
  contactNumber: string
  classification: string
  is4PsBeneficiary: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export function toHouseholdPayload(values: HouseholdFormValues) {
  return {
    sitioId: values.sitioId,
    purokId: values.purokId,
    street: values.street,
    houseNumber: values.houseNumber,
    headResidentId: values.headResidentId,
    memberIds: values.memberIds,
    memberRelationships: values.memberRelationships,
    contactNumber: values.contactNumber,
    classification: CLASSIFICATION_TO_BACKEND[values.classification],
    is4PsBeneficiary: values.is4PsBeneficiary,
  }
}

export function fromHouseholdDto(dto: BackendHousehold): Household {
  return {
    id: dto.id,
    householdNumber: dto.householdNumber,
    sitioId: dto.sitioId,
    purokId: dto.purokId,
    address: { street: dto.street, houseNumber: dto.houseNumber },
    headResidentId: dto.headResidentId ?? "",
    memberIds: dto.members.map((m) => m.id),
    contactNumber: dto.contactNumber,
    classification: CLASSIFICATION_FROM_BACKEND[dto.classification] ?? "Not Classified",
    is4PsBeneficiary: dto.is4PsBeneficiary,
    isArchived: dto.isArchived,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
