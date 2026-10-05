import { getResidentFullName } from "@/data/residents"
import type { Household, Resident } from "@/types"

export function householdMatchesSearch(household: Household, residentMap: Map<string, Resident>, term: string): boolean {
  const query = term.trim().toLowerCase()
  if (!query) return true

  if (household.householdNumber.toLowerCase().includes(query)) return true
  if (household.contactNumber.toLowerCase().includes(query)) return true
  if (`${household.address.houseNumber} ${household.address.street}`.toLowerCase().includes(query)) return true

  const head = residentMap.get(household.headResidentId)
  if (head && getResidentFullName(head).toLowerCase().includes(query)) return true

  return household.memberIds.some((id) => {
    const member = residentMap.get(id)
    return member ? getResidentFullName(member).toLowerCase().includes(query) : false
  })
}
