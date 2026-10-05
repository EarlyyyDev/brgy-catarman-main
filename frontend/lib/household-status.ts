import type { Household, Resident } from "@/types"

export type HouseholdStatus = "Active" | "Inactive" | "Archived"

export function getHouseholdStatus(household: Household, residentMap: Map<string, Resident>): HouseholdStatus {
  if (household.isArchived) return "Archived"
  return residentMap.has(household.headResidentId) ? "Active" : "Inactive"
}
