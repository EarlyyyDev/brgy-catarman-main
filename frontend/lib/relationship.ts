import { getResidentAge } from "@/data/residents"
import type { Resident } from "@/types"

/**
 * The data model has no stored family-relationship field, so this infers a
 * display label from age gap, gender, and civil status relative to the
 * household head. It is a heuristic for the seed/demo data, not authoritative
 * genealogy — labels default to "Relative" whenever the heuristic isn't confident.
 */
export function getRelationshipToHead(member: Resident, head: Resident): string {
  if (member.id === head.id) return "Head"

  const memberAge = getResidentAge(member.birthdate)
  const headAge = getResidentAge(head.birthdate)
  const ageDiff = memberAge - headAge

  const isLikelySpouse =
    member.gender !== head.gender && member.civilStatus === "Married" && head.civilStatus === "Married" && Math.abs(ageDiff) <= 12
  if (isLikelySpouse) return member.gender === "Female" ? "Wife" : "Husband"

  if (ageDiff >= 35) return "Grandparent"
  if (ageDiff >= 12) return member.gender === "Male" ? "Father" : "Mother"
  if (ageDiff <= -35) return "Relative"
  if (ageDiff <= -12) return member.gender === "Male" ? "Son" : "Daughter"

  return member.gender === "Male" ? "Brother" : "Sister"
}
