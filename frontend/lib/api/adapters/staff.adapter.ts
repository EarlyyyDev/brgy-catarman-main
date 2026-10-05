import type { StaffMember, UserRole, UserStatus } from "@/types"
import type { BackendUser } from "@/lib/api/endpoints"
import { roleToBackend } from "./auth.adapter"

const STATUS_FROM_BACKEND: Record<string, UserStatus> = { ACTIVE: "Active", DISABLED: "Disabled" }
const STATUS_TO_BACKEND: Record<UserStatus, string> = { Active: "ACTIVE", Disabled: "DISABLED" }

export function toStaffMember(user: BackendUser): StaffMember {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ADMINISTRATOR" ? "Administrator" : "Staff",
    position: user.position,
    avatarUrl: user.avatarUrl ?? undefined,
    status: STATUS_FROM_BACKEND[user.status ?? "ACTIVE"] ?? "Active",
    contactNumber: user.contactNumber ?? undefined,
    lastLogin: user.lastLogin ?? undefined,
    createdAt: "",
  }
}

export function staffFormToPayload(values: { name: string; email: string; role: UserRole; position: string; contactNumber?: string }) {
  return {
    name: values.name,
    email: values.email,
    role: roleToBackend(values.role),
    position: values.position,
    contactNumber: values.contactNumber || undefined,
  }
}

export { STATUS_TO_BACKEND }
