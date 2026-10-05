import type { Resident } from "@/types"

export function getResidentFullName(resident: Resident): string {
  return [resident.firstName, resident.middleName, resident.lastName, resident.suffix]
    .filter(Boolean)
    .join(" ")
}

export function getResidentInitials(resident: Pick<Resident, "firstName" | "lastName">): string {
  return `${resident.firstName.charAt(0)}${resident.lastName.charAt(0)}`.toUpperCase()
}

export function getResidentAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}
