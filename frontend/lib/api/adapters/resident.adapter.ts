import type { Address, HouseholdPurok, Resident, ResidentFormValues, ResidentTagType } from "@/types"

const GENDER_TO_BACKEND: Record<string, string> = { Male: "MALE", Female: "FEMALE" }
const GENDER_FROM_BACKEND: Record<string, Resident["gender"]> = { MALE: "Male", FEMALE: "Female" }

const CIVIL_STATUS_TO_BACKEND: Record<string, string> = {
  Single: "SINGLE",
  Married: "MARRIED",
  Widowed: "WIDOWED",
  Separated: "SEPARATED",
  Divorced: "DIVORCED",
}
const CIVIL_STATUS_FROM_BACKEND: Record<string, Resident["civilStatus"]> = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
  DIVORCED: "Divorced",
}

const TAG_TO_BACKEND: Record<ResidentTagType, string> = {
  "Senior Citizen": "SENIOR_CITIZEN",
  PWD: "PWD",
  "Solo Parent": "SOLO_PARENT",
  Woman: "WOMAN",
  Fisherfolk: "FISHERFOLK",
  "4Ps Beneficiary": "FOUR_PS_BENEFICIARY",
  Indigent: "INDIGENT",
  Indigenous: "INDIGENOUS",
  Youth: "YOUTH",
  Pregnant: "PREGNANT",
  Student: "STUDENT",
  OFW: "OFW",
  Veteran: "VETERAN",
}
const TAG_FROM_BACKEND: Record<string, ResidentTagType> = Object.fromEntries(
  Object.entries(TAG_TO_BACKEND).map(([display, backend]) => [backend, display as ResidentTagType]),
)

interface BackendResidentTag {
  tagType: string
}

interface BackendResident {
  id: string
  photoUrl?: string | null
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  gender: string
  birthdate: string
  civilStatus: string
  religion?: string | null
  occupation?: string | null
  educationalAttainment?: string | null
  purokId: string
  purok?: { id: string; name: string }
  street: string
  houseNumber: string
  contactNumber: string
  email?: string | null
  householdId?: string | null
  relationshipToHead?: string | null
  emergencyContactName?: string | null
  emergencyContactNumber?: string | null
  tags: BackendResidentTag[]
  isRegisteredVoter: boolean
  isHouseholdHead: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Resolves a purok display name (the frontend form's dropdown value) to the
 * real backend purokId UUID. Puroks are seeded with names that exactly match
 * the frontend's fixed Purok union, so an exact-name lookup is reliable. */
export function purokNameToId(name: string, puroks: HouseholdPurok[]): string | undefined {
  return puroks.find((p) => p.name === name)?.id
}

export function toResidentPayload(values: ResidentFormValues, puroks: HouseholdPurok[]) {
  const purokId = purokNameToId(values.purok, puroks)
  return {
    photoUrl: values.photoUrl || undefined,
    firstName: values.firstName,
    middleName: values.middleName || undefined,
    lastName: values.lastName,
    suffix: values.suffix || undefined,
    gender: GENDER_TO_BACKEND[values.gender],
    birthdate: values.birthdate,
    civilStatus: CIVIL_STATUS_TO_BACKEND[values.civilStatus],
    religion: values.religion || undefined,
    occupation: values.occupation || undefined,
    educationalAttainment: values.educationalAttainment || undefined,
    purokId,
    street: values.street,
    houseNumber: values.houseNumber,
    contactNumber: values.contactNumber,
    email: values.email || undefined,
    emergencyContactName: values.emergencyContactName || undefined,
    emergencyContactNumber: values.emergencyContactNumber || undefined,
    isRegisteredVoter: values.isRegisteredVoter,
  }
}

export function tagsToPayload(tags: ResidentTagType[]) {
  return tags.map((t) => ({ tagType: TAG_TO_BACKEND[t] }))
}

export function fromResidentDto(dto: BackendResident): Resident {
  const address: Address = {
    purok: (dto.purok?.name ?? "") as Address["purok"],
    street: dto.street,
    houseNumber: dto.houseNumber,
  }

  return {
    id: dto.id,
    photoUrl: dto.photoUrl ?? "",
    firstName: dto.firstName,
    middleName: dto.middleName ?? undefined,
    lastName: dto.lastName,
    suffix: dto.suffix ?? undefined,
    gender: GENDER_FROM_BACKEND[dto.gender] ?? "Male",
    birthdate: dto.birthdate,
    civilStatus: CIVIL_STATUS_FROM_BACKEND[dto.civilStatus] ?? "Single",
    religion: dto.religion ?? undefined,
    occupation: dto.occupation ?? undefined,
    educationalAttainment: dto.educationalAttainment ?? undefined,
    address,
    contactNumber: dto.contactNumber,
    email: dto.email ?? undefined,
    householdId: dto.householdId ?? undefined,
    relationshipToHead: dto.relationshipToHead ?? undefined,
    emergencyContactName: dto.emergencyContactName ?? undefined,
    emergencyContactNumber: dto.emergencyContactNumber ?? undefined,
    tags: dto.tags.map((t) => TAG_FROM_BACKEND[t.tagType]).filter(Boolean),
    isRegisteredVoter: dto.isRegisteredVoter,
    isHouseholdHead: dto.isHouseholdHead,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
