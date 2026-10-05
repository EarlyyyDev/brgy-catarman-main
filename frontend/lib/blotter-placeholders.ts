import { formatDate } from "@/lib/format"
import type { Blotter, BlotterHearing, Official, SystemSettings } from "@/types"

export interface PlaceholderDef {
  token: string
  label: string
}

export interface PlaceholderGroup {
  label: string
  items: PlaceholderDef[]
}

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    label: "Case Information",
    items: [
      { token: "case_number", label: "Case Number" },
      { token: "incident_type", label: "Incident Type" },
      { token: "incident_date", label: "Date of Incident" },
      { token: "location", label: "Location" },
    ],
  },
  {
    label: "Complainant",
    items: [
      { token: "complainant_name", label: "Complainant Name" },
      { token: "complainant_address", label: "Complainant Address" },
      { token: "complainant_contact", label: "Complainant Contact" },
    ],
  },
  {
    label: "Respondent",
    items: [
      { token: "respondent_name", label: "Respondent Name" },
      { token: "respondent_address", label: "Respondent Address" },
    ],
  },
  {
    label: "Case Details",
    items: [
      { token: "narrative", label: "Narrative of Complaint" },
      { token: "resolution", label: "Resolution" },
      { token: "mediator", label: "Mediator Name" },
    ],
  },
  {
    label: "Barangay Information",
    items: [
      { token: "barangay", label: "Barangay" },
      { token: "municipality", label: "Municipality" },
      { token: "province", label: "Province" },
    ],
  },
  {
    label: "Visual Elements",
    items: [
      { token: "barangay_logo", label: "Barangay Logo" },
      { token: "municipal_logo", label: "Municipal Logo" },
      { token: "barangay_seal", label: "Barangay Dry Seal" },
      { token: "mediator_signature", label: "Mediator Signature" },
      { token: "hearing_schedule", label: "Hearing Schedule" },
      { token: "qr_code", label: "QR Code" },
    ],
  },
]

const MEDIA_TOKENS = new Set(["barangay_logo", "municipal_logo", "barangay_seal", "mediator_signature", "hearing_schedule", "qr_code"])

export interface SampleBlotterData {
  case_number: string
  incident_type: string
  incident_date: string
  location: string
  complainant_name: string
  complainant_address: string
  complainant_contact: string
  respondent_name: string
  respondent_address: string
  narrative: string
  resolution: string
  mediator: string
  barangay: string
  municipality: string
  province: string
}

export function buildSampleBlotterData(officials: Official[], settings: SystemSettings): SampleBlotterData {
  const captain = officials.find((o) => o.position === "Punong Barangay")

  return {
    case_number: "BLT-2026-SAMPLE",
    incident_type: "Property Dispute",
    incident_date: "August 4, 2026",
    location: `Rizal Street, Purok 1, ${settings.barangayName}`,
    complainant_name: "Juan Dela Cruz Santos",
    complainant_address: `123 Rizal Street, Purok 1, ${settings.barangayName}`,
    complainant_contact: "0917 234 5678",
    respondent_name: "Pedro Reyes Bautista",
    respondent_address: `45 Bonifacio Street, Purok 1, ${settings.barangayName}`,
    narrative:
      "Sample narrative describing the nature of the dispute for template preview purposes. This section documents the complainant's account of the incident as recorded by the Lupon Secretary.",
    resolution: "Sample resolution reached during mediation, for template preview purposes.",
    mediator: captain?.name ?? "Hon. Ramon Villanueva Cruz",
    barangay: settings.barangayName,
    municipality: settings.municipality,
    province: settings.province,
  }
}

/**
 * Real data for an actual filed blotter case -- as opposed to
 * buildSampleBlotterData, which fabricates a "Juan Dela Cruz vs. Pedro Reyes"
 * placeholder purely for previewing a template.
 */
export function buildBlotterData(blotter: Blotter, officials: Official[], settings: SystemSettings): SampleBlotterData {
  const captain = officials.find((o) => o.position === "Punong Barangay")

  return {
    case_number: blotter.caseNumber,
    incident_type: blotter.incidentType,
    incident_date: formatDate(blotter.incidentDate),
    location: blotter.location,
    complainant_name: blotter.complainantName,
    complainant_address: blotter.complainantAddress,
    complainant_contact: blotter.complainantContact,
    respondent_name: blotter.respondentName,
    respondent_address: blotter.respondentAddress,
    narrative: blotter.narrative,
    resolution: blotter.resolution ?? "",
    mediator: blotter.mediator ?? captain?.name ?? "",
    barangay: settings.barangayName,
    municipality: settings.municipality,
    province: settings.province,
  }
}

function logoSvg(imageUrl: string | undefined, size: number): string {
  const fontSize = Math.round(size * 0.28)
  if (imageUrl) {
    return `<img src="${imageUrl}" alt="" style="display:inline-block;width:${size}px;height:${size}px;border-radius:9999px;object-fit:cover;border:2px solid #0F172A;" />`
  }
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(135deg,#D4AF37,#8a6d1a);color:#0F172A;font-family:Georgia,serif;font-weight:700;font-size:${fontSize}px;border:2px solid #0F172A;">BC</span>`
}

function municipalityInitials(name: string): string {
  const words = name.split(" ").filter((w) => w.length > 2)
  if (words.length === 0) return "?"
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return (words.length === 1 ? first : first + last).toUpperCase()
}

function municipalLogoSvg(imageUrl: string | undefined, size: number, municipalityName: string): string {
  const fontSize = Math.round(size * 0.28)
  if (imageUrl) {
    return `<img src="${imageUrl}" alt="" style="display:inline-block;width:${size}px;height:${size}px;border-radius:9999px;object-fit:cover;border:2px solid #0F172A;" />`
  }
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(135deg,#3D68AB,#0F2C5F);color:#fff;font-family:Georgia,serif;font-weight:700;font-size:${fontSize}px;border:2px solid #0F172A;">${municipalityInitials(municipalityName)}</span>`
}

function drySealSvg(): string {
  return `<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:96px;height:96px;border-radius:9999px;border:2px dashed #64748B;color:#64748B;font-size:9px;font-weight:700;letter-spacing:0.05em;text-align:center;transform:rotate(-12deg);opacity:0.65;">OFFICIAL<br/>SEAL<br/>SAMPLE</span>`
}

function signatureBlock(name: string, role: string): string {
  return `<span style="display:inline-flex;flex-direction:column;align-items:center;min-width:220px;"><span style="font-family:'Brush Script MT',cursive;font-size:26px;">${name}</span><span style="margin-top:2px;width:100%;border-top:1px solid #0F172A;padding-top:4px;font-size:11px;font-weight:600;">${role}</span></span>`
}

function hearingScheduleHtml(hearings: BlotterHearing[]): string {
  if (hearings.length === 0) {
    return `<p style="margin:0; color:#5B6B85;">No hearings scheduled.</p>`
  }
  const items = hearings
    .map((h) => `<li style="margin:2px 0;">${formatDate(h.date)} — ${h.status}${h.notes ? `: ${escapeHtml(h.notes)}` : ""}</li>`)
    .join("")
  return `<ul style="margin:0; padding-left:18px;">${items}</ul>`
}

function qrCodeSvg(value: string): string {
  let cells = ""
  let seed = 0
  for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i)
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      seed = (seed * 9301 + 49297) % 233280
      const on = seed / 233280 > 0.45
      if (on) cells += `<rect x="${col * 12}" y="${row * 12}" width="10" height="10" fill="#0F172A"/>`
    }
  }
  return `<svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #E2E8F0;padding:2px;">${cells}</svg>`
}

interface RenderOptions {
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  barangayLogoUrl?: string
  municipalLogoUrl?: string
  logoSize: number
  municipalityName: string
  hearings: BlotterHearing[]
}

export function renderBlotterTemplateHtml(bodyHtml: string, data: SampleBlotterData, options: RenderOptions): string {
  let html = bodyHtml

  for (const group of PLACEHOLDER_GROUPS) {
    for (const { token } of group.items) {
      const pattern = new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, "g")
      if (!MEDIA_TOKENS.has(token)) {
        const value = (data as unknown as Record<string, string>)[token] ?? ""
        html = html.replace(pattern, escapeHtml(value))
        continue
      }

      let replacement = ""
      switch (token) {
        case "barangay_logo":
          replacement = options.showBarangayLogo ? logoSvg(options.barangayLogoUrl, options.logoSize) : ""
          break
        case "municipal_logo":
          replacement = options.showMunicipalLogo ? municipalLogoSvg(options.municipalLogoUrl, options.logoSize, options.municipalityName) : ""
          break
        case "barangay_seal":
          replacement = options.showBarangayDrySeal ? drySealSvg() : ""
          break
        case "mediator_signature":
          replacement = signatureBlock(data.mediator, "Lupon Tagapamayapa / Mediator")
          break
        case "hearing_schedule":
          replacement = hearingScheduleHtml(options.hearings)
          break
        case "qr_code":
          replacement = qrCodeSvg(data.case_number)
          break
      }
      html = html.replace(pattern, replacement)
    }
  }

  return html
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
