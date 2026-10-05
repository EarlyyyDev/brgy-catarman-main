import type { Purok, CivilStatus, ResidentTagType, HouseholdClassification } from "@/types"

export const PUROKS: Purok[] = [
  "Purok 1 - Poblacion",
  "Purok 2 - Riverside",
  "Purok 3 - Mabuhay",
  "Purok 4 - San Isidro",
  "Purok 5 - Maligaya",
  "Purok 6 - Bagong Silang",
]

export const CIVIL_STATUSES: CivilStatus[] = ["Single", "Married", "Widowed", "Separated", "Divorced"]

export const RESIDENT_TAGS: ResidentTagType[] = [
  "Senior Citizen",
  "PWD",
  "Solo Parent",
  "Woman",
  "Fisherfolk",
  "Indigenous",
  "Youth",
  "Pregnant",
  "Student",
  "OFW",
  "Veteran",
  "4Ps Beneficiary",
  "Indigent",
]

export const HOUSEHOLD_CLASSIFICATIONS: HouseholdClassification[] = ["NHTS Poor", "Low Income", "Middle Income", "Not Classified"]

export const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Grandparent",
  "Sibling",
  "Relative",
  "Boarder",
  "Guardian",
]

export const RELIGIONS = [
  "Roman Catholic",
  "Iglesia ni Cristo",
  "Born Again Christian",
  "Baptist",
  "Aglipayan",
  "Islam",
  "Seventh-day Adventist",
  "Other",
]

export const OCCUPATIONS = [
  "Farmer",
  "Fisherfolk",
  "Tricycle Driver",
  "Sari-Sari Store Owner",
  "Public School Teacher",
  "Construction Worker",
  "OFW",
  "Government Employee",
  "Vendor",
  "Carpenter",
  "Private Employee",
  "Self-Employed",
  "Barangay Health Worker",
  "Unemployed",
  "Student",
  "Retired",
]

export const EDUCATION_LEVELS = [
  "Elementary Undergraduate",
  "Elementary Graduate",
  "High School Undergraduate",
  "High School Graduate",
  "Senior High School Graduate",
  "Vocational Graduate",
  "College Undergraduate",
  "College Graduate",
  "Post Graduate",
]
