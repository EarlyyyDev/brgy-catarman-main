import { Request } from "express";
import { settingsRepository } from "../repositories/settings.repository";
import { activityLogService } from "./activityLog.service";

export interface SettingsInput {
  barangayName?: string;
  municipality?: string;
  province?: string;
  zipCode?: string;
  fullAddress?: string;
  logoUrl?: string;
  sealUrl?: string;
  municipalLogoUrl?: string;
  documentLogoUrl?: string;
  heroBackgroundUrl?: string;
  loginBackgroundUrl?: string;
  aiAssistantAvatarUrl?: string;
  contactNumbers?: string[];
  emailAddress?: string;
  officeHours?: string;
  facebookUrl?: string;
  missionStatement?: string;
  visionStatement?: string;
  historyText?: string;
  goals?: string[];
  objectives?: string[];
  founded?: string;
  landArea?: string;
  population?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpSenderName?: string;
  themePrimaryColor?: string;
  themeAccentColor?: string;
  claimDeadlineDays?: number;
  autoExpireHours?: number;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}

// Operational fields (SMTP config) that must never reach an anonymous
// public-site visitor — see the announcement author passwordHash leak fixed
// earlier in this build; same category of mistake, different field set.
const PUBLIC_FIELD_DENYLIST = new Set(["smtpHost", "smtpPort", "smtpUsername", "smtpSenderName", "updatedById"]);

async function getFull() {
  return settingsRepository.get();
}

async function getPublic() {
  const settings = await settingsRepository.get();
  if (!settings) {
    return null;
  }
  return Object.fromEntries(Object.entries(settings).filter(([key]) => !PUBLIC_FIELD_DENYLIST.has(key)));
}

async function update(input: SettingsInput, req: Request) {
  const settings = await settingsRepository.upsert({ ...input, updatedById: req.user!.id });
  await activityLogService.log({ req, action: "Updated system settings", module: "SETTINGS" });
  return settings;
}

async function submitContactForm(input: { name: string; email: string; subject: string; message: string }, req: Request) {
  await activityLogService.log({
    req,
    action: "Contact form submitted",
    module: "SETTINGS",
    description: `${input.name} <${input.email}>: ${input.subject} — ${input.message}`,
  });
}

export const settingsService = { getFull, getPublic, update, submitContactForm };
