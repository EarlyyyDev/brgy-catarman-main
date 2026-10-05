export interface SystemSettings {
  barangayName: string
  municipality: string
  province: string
  zipCode: string
  fullAddress: string
  logoUrl: string
  sealUrl: string
  municipalLogoUrl?: string
  /** Barangay logo used on printed certificates/blotter records only -- kept
   * separate from logoUrl (the site-wide brand mark) so uploading one never
   * changes the other. */
  documentLogoUrl?: string
  /** Chathead picture for the public-facing AI assistant widget. */
  aiAssistantAvatarUrl?: string
  heroBackgroundUrl?: string
  loginBackgroundUrl?: string
  contactNumbers: string[]
  emailAddress: string
  officeHours: string
  facebookUrl?: string
  missionStatement: string
  visionStatement: string
  historyText: string
  goals: string[]
  objectives: string[]
  founded: string
  landArea: string
  population: string
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpSenderName: string
  themePrimaryColor: string
  themeAccentColor: string
  claimDeadlineDays: number
  autoExpireHours: number
  maintenanceMode: boolean
  maintenanceMessage: string
}

export interface BackupRecord {
  id: string
  fileName: string
  sizeMb: number
  type: "Manual" | "Automatic"
  status: "Completed" | "Failed" | "In Progress"
  createdBy: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  actorName: string
  actorRole: "Staff" | "Administrator" | "System"
  action: string
  module:
    | "Authentication"
    | "Residents"
    | "Households"
    | "Certificates"
    | "Complaints"
    | "Blotters"
    | "Announcements"
    | "Settings"
    | "Backup"
    | "Staff"
  description: string
  ipAddress: string
  browser: string
  status: "Success" | "Failed"
  timestamp: string
}

export interface AppNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  link?: string
  createdAt: string
}
