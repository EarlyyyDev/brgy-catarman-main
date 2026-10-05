export type HouseholdClassification = "NHTS Poor" | "Low Income" | "Middle Income" | "Not Classified"

export interface Sitio {
  id: string
  name: string
}

export interface HouseholdPurok {
  id: string
  sitioId: string
  name: string
}

export interface HouseholdAddress {
  street: string
  houseNumber: string
}

export interface Household {
  id: string
  householdNumber: string
  sitioId: string
  purokId: string
  address: HouseholdAddress
  headResidentId: string
  memberIds: string[]
  contactNumber: string
  classification: HouseholdClassification
  is4PsBeneficiary: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface HouseholdFormValues {
  sitioId: string
  purokId: string
  street: string
  houseNumber: string
  headResidentId: string
  memberIds: string[]
  memberRelationships?: Record<string, string>
  contactNumber: string
  classification: HouseholdClassification
  is4PsBeneficiary: boolean
}
