import type { AuthSession, UserRole } from "@/types"
import type { BackendUser } from "@/lib/api/endpoints"

const ROLE_FROM_BACKEND: Record<BackendUser["role"], UserRole> = {
  STAFF: "Staff",
  ADMINISTRATOR: "Administrator",
}

const ROLE_TO_BACKEND: Record<UserRole, BackendUser["role"]> = {
  Staff: "STAFF",
  Administrator: "ADMINISTRATOR",
}

export function toAuthSession(user: BackendUser): AuthSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: ROLE_FROM_BACKEND[user.role],
    avatarUrl: user.avatarUrl ?? undefined,
    position: user.position,
    securityQuestionsSet: user.securityQuestionsSet ?? false,
    securityQuestion1: user.securityQuestion1,
    securityQuestion2: user.securityQuestion2,
  }
}

export function roleToBackend(role: UserRole): BackendUser["role"] {
  return ROLE_TO_BACKEND[role]
}
