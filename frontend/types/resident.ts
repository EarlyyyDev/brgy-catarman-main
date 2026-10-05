import type { Address } from "./common"

export type Gender = "Male" | "Female"

export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Divorced"

export type ResidentTagType =
  | "Senior Citizen"
  | "PWD"
  | "Solo Parent"
  | "Woman"
  | "Fisherfolk"
  | "4Ps Beneficiary"
  | "Indigent"
  | "Indigenous"
  | "Youth"
  | "Pregnant"
  | "Student"
  | "OFW"
  | "Veteran"

export interface Resident {
  id: string
  photoUrl: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  gender: Gender
  birthdate: string
  civilStatus: CivilStatus
  religion?: string
  occupation?: string
  educationalAttainment?: string
  address: Address
  contactNumber: string
  email?: string
  householdId?: string
  relationshipToHead?: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  tags: ResidentTagType[]
  isRegisteredVoter: boolean
  isHouseholdHead: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ResidentFormValues {
  photoUrl?: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  gender: Gender
  birthdate: string
  civilStatus: CivilStatus
  religion?: string
  occupation?: string
  educationalAttainment?: string
  purok: string
  street: string
  houseNumber: string
  contactNumber: string
  email?: string
  householdId?: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  tags: ResidentTagType[]
  isRegisteredVoter: boolean
}
