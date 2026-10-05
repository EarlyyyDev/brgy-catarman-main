import type { SystemSettings } from "@/types"

/** Backend fields are nullable; frontend SystemSettings treats every field as
 * always-a-string, so nulls collapse to "" (matches the frontend's existing
 * "not yet configured" convention). */
export function toSystemSettings(raw: Record<string, unknown>): SystemSettings {
  const str = (v: unknown) => (typeof v === "string" ? v : "")
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])
  const num = (v: unknown, fallback: number) => (typeof v === "number" ? v : fallback)
  const bool = (v: unknown) => v === true

  return {
    barangayName: str(raw.barangayName) || "Barangay Catarman",
    municipality: str(raw.municipality),
    province: str(raw.province),
    zipCode: str(raw.zipCode),
    fullAddress: str(raw.fullAddress),
    logoUrl: str(raw.logoUrl),
    sealUrl: str(raw.sealUrl),
    municipalLogoUrl: str(raw.municipalLogoUrl) || undefined,
    documentLogoUrl: str(raw.documentLogoUrl) || undefined,
    aiAssistantAvatarUrl: str(raw.aiAssistantAvatarUrl) || undefined,
    heroBackgroundUrl: str(raw.heroBackgroundUrl) || undefined,
    loginBackgroundUrl: str(raw.loginBackgroundUrl) || undefined,
    contactNumbers: arr(raw.contactNumbers),
    emailAddress: str(raw.emailAddress),
    officeHours: str(raw.officeHours),
    facebookUrl: str(raw.facebookUrl) || undefined,
    missionStatement: str(raw.missionStatement),
    visionStatement: str(raw.visionStatement),
    historyText: str(raw.historyText),
    goals: arr(raw.goals),
    objectives: arr(raw.objectives),
    founded: str(raw.founded),
    landArea: str(raw.landArea),
    population: str(raw.population),
    smtpHost: str(raw.smtpHost),
    smtpPort: str(raw.smtpPort),
    smtpUsername: str(raw.smtpUsername),
    smtpSenderName: str(raw.smtpSenderName),
    themePrimaryColor: str(raw.themePrimaryColor),
    themeAccentColor: str(raw.themeAccentColor),
    claimDeadlineDays: num(raw.claimDeadlineDays, 30),
    autoExpireHours: num(raw.autoExpireHours, 72),
    maintenanceMode: bool(raw.maintenanceMode),
    maintenanceMessage: str(raw.maintenanceMessage),
  }
}
