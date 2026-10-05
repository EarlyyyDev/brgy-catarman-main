export type UserRole = "Staff" | "Administrator"

export type UserStatus = "Active" | "Disabled"

export interface StaffMember {
  id: string
  name: string
  email: string
  role: UserRole
  position: string
  avatarUrl?: string
  status: UserStatus
  contactNumber?: string
  lastLogin?: string
  createdAt: string
  /** Overrides the shared demo password for this account, if set. */
  password?: string
}

export interface StaffFormValues {
  name: string
  email: string
  role: UserRole
  position: string
  contactNumber?: string
  /** Status changes go through the dedicated toggle-status endpoint, not create/update. */
  status?: UserStatus
}

export interface AuthSession {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  position: string
  securityQuestionsSet: boolean
  securityQuestion1?: string
  securityQuestion2?: string
}
