import { getResidentAge, getResidentFullName } from "@/data/residents"
import { formatDate } from "@/lib/format"
import type { CertificateRequest, CertificateTemplateType, Official, Resident, SystemSettings } from "@/types"

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
    label: "Resident Information",
    items: [
      { token: "resident_full_name", label: "Full Name" },
      { token: "first_name", label: "First Name" },
      { token: "middle_name", label: "Middle Name" },
      { token: "last_name", label: "Last Name" },
      { token: "suffix", label: "Suffix" },
      { token: "gender", label: "Gender" },
      { token: "age", label: "Age" },
      { token: "birth_date", label: "Birth Date" },
      { token: "birth_place", label: "Birth Place" },
      { token: "civil_status", label: "Civil Status" },
      { token: "nationality", label: "Nationality" },
      { token: "occupation", label: "Occupation" },
    ],
  },
  {
    label: "Address",
    items: [
      { token: "address", label: "Full Address" },
      { token: "purok", label: "Purok" },
      { token: "barangay", label: "Barangay" },
      { token: "municipality", label: "Municipality" },
      { token: "province", label: "Province" },
    ],
  },
  {
    label: "Certificate Details",
    items: [
      { token: "certificate_type", label: "Certificate Type" },
      { token: "purpose", label: "Purpose" },
      { token: "date_issued", label: "Date Issued" },
      { token: "reference_number", label: "Reference Number" },
      { token: "issued_by", label: "Issued By" },
    ],
  },
  {
    label: "Barangay Officials",
    items: [
      { token: "barangay_captain", label: "Barangay Captain Name" },
      { token: "barangay_secretary", label: "Barangay Secretary Name" },
    ],
  },
  {
    label: "Visual Elements",
    items: [
      { token: "resident_photo", label: "Resident Photo" },
      { token: "barangay_logo", label: "Barangay Logo" },
      { token: "municipal_logo", label: "Municipal Logo" },
      { token: "barangay_seal", label: "Barangay Dry Seal" },
      { token: "captain_signature", label: "Captain Signature" },
      { token: "secretary_signature", label: "Secretary Signature" },
      { token: "qr_code", label: "QR Code" },
    ],
  },
]

const MEDIA_TOKENS = new Set(["resident_photo", "barangay_logo", "municipal_logo", "barangay_seal", "captain_signature", "secretary_signature", "qr_code"])

export interface SampleCertificateData {
  resident_full_name: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  gender: string
  age: string
  birth_date: string
  birth_place: string
  civil_status: string
  nationality: string
  occupation: string
  address: string
  purok: string
  barangay: string
  municipality: string
  province: string
  certificate_type: string
  purpose: string
  date_issued: string
  reference_number: string
  issued_by: string
  barangay_captain: string
  barangay_secretary: string
}

export function buildSampleData(certificateType: CertificateTemplateType, officials: Official[], settings: SystemSettings): SampleCertificateData {
  const captain = officials.find((o) => o.position === "Punong Barangay")
  const secretary = officials.find((o) => o.position === "Barangay Secretary")

  return {
    resident_full_name: "Juan Dela Cruz",
    first_name: "Juan",
    middle_name: "Reyes",
    last_name: "Dela Cruz",
    suffix: "—",
    gender: "Male",
    age: "27",
    birth_date: "March 12, 1999",
    birth_place: settings.barangayName,
    civil_status: "Single",
    nationality: "Filipino",
    occupation: "Private Employee",
    address: `Purok 3, ${settings.barangayName}, ${settings.municipality}`,
    purok: "Purok 3",
    barangay: settings.barangayName,
    municipality: settings.municipality,
    province: settings.province,
    certificate_type: certificateType,
    purpose: "Local Employment",
    date_issued: "August 4, 2026",
    reference_number: "BC-2026-00125",
    issued_by: captain?.name ?? "Barangay Captain",
    barangay_captain: captain?.name ?? "Barangay Captain",
    barangay_secretary: secretary?.name ?? "Barangay Secretary",
  }
}

/**
 * Real data for an actual issued certificate -- as opposed to buildSampleData,
 * which fabricates a "Juan Dela Cruz" placeholder purely for previewing a
 * template. Fields with no source on the request (and no linked resident
 * record to fall back on) are left blank rather than faked, since this
 * populates a real document.
 */
export function buildRequestData(
  request: CertificateRequest,
  officials: Official[],
  settings: SystemSettings,
  resident?: Resident
): SampleCertificateData {
  const captain = officials.find((o) => o.position === "Punong Barangay")
  const secretary = officials.find((o) => o.position === "Barangay Secretary")
  const documentTypeLabel = request.documentType === "Other Barangay Document" ? request.otherDocumentLabel ?? request.documentType : request.documentType

  return {
    resident_full_name: resident ? getResidentFullName(resident) : request.requestorName,
    first_name: resident?.firstName ?? "",
    middle_name: resident?.middleName ?? "",
    last_name: resident?.lastName ?? "",
    suffix: resident?.suffix ?? "",
    gender: resident?.gender ?? "",
    age: resident ? String(getResidentAge(resident.birthdate)) : "",
    birth_date: resident ? formatDate(resident.birthdate) : "",
    birth_place: settings.barangayName,
    civil_status: resident?.civilStatus ?? "",
    nationality: "Filipino",
    occupation: resident?.occupation ?? "",
    address: request.address,
    purok: "",
    barangay: settings.barangayName,
    municipality: settings.municipality,
    province: settings.province,
    certificate_type: documentTypeLabel,
    purpose: request.purpose,
    date_issued: formatDate(request.approvedAt ?? request.submittedAt, "MMMM d, yyyy"),
    reference_number: request.referenceNumber,
    issued_by: captain?.name ?? "Barangay Captain",
    barangay_captain: captain?.name ?? "Barangay Captain",
    barangay_secretary: secretary?.name ?? "Barangay Secretary",
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
}

function logoSvg(imageUrl: string | undefined, size: number): string {
  const fontSize = Math.round(size * 0.28)
  if (imageUrl) {
    return `<img src="${imageUrl}" alt="" style="display:inline-block;width:${size}px;height:${size}px;border-radius:9999px;object-fit:cover;border:2px solid #0F172A;" />`
  }
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(135deg,#D4AF37,#8a6d1a);color:#0F172A;font-family:Georgia,serif;font-weight:700;font-size:${fontSize}px;border:2px solid #0F172A;">BC</span>`
}

function municipalityInitials(name: string): string {
  // "Municipality of Cordova" -> "MC", not "MO" -- skip filler words like
  // "of"/"de" so the abbreviation reads as the actual place name.
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

function residentPhotoBox(name: string, photoUrl?: string): string {
  if (photoUrl) {
    return `<img src="${photoUrl}" alt="" style="display:inline-block;width:96px;height:112px;object-fit:cover;border:1px solid #E2E8F0;" />`
  }
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:96px;height:112px;border:1px solid #E2E8F0;background:#0F172A;color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:700;">${initials(name)}</span>`
}

function signatureBlock(name: string, role: string): string {
  return `<span style="display:inline-flex;flex-direction:column;align-items:center;min-width:220px;"><span style="font-family:'Brush Script MT',cursive;font-size:26px;">${name}</span><span style="margin-top:2px;width:100%;border-top:1px solid #0F172A;padding-top:4px;font-size:11px;font-weight:600;">${role}</span></span>`
}

function qrCodeSvg(value: string): string {
  // Decorative QR-like grid for template preview purposes only. The real
  // scannable QR is generated at certificate issuance time (qrcode.react),
  // not inside the template editor/preview.
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
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  barangayLogoUrl?: string
  municipalLogoUrl?: string
  logoSize: number
  municipalityName: string
  residentPhotoUrl?: string
}

/** Renders the barangay/municipal logos as an automatic letterhead-style
 * header at the top of the document -- driven purely by the Show
 * Barangay/Municipal Logo toggles, independent of whether the template body
 * happens to also contain a manually-placed {{barangay_logo}}/
 * {{municipal_logo}} token (that inline mechanism still works too, for
 * anyone who wants a logo mark somewhere specific inside the body text). */
function logoHeader(options: RenderOptions): string {
  const municipal = options.showMunicipalLogo ? municipalLogoSvg(options.municipalLogoUrl, options.logoSize, options.municipalityName) : ""
  const barangay = options.showBarangayLogo ? logoSvg(options.barangayLogoUrl, options.logoSize) : ""
  const logos = [municipal, barangay].filter(Boolean)
  if (logos.length === 0) return ""
  // Two logos sit flush at the page's left/right margins (like a real
  // letterhead); a single logo stays centered, matching how it looked before
  // the second one was ever turned on.
  const justify = logos.length > 1 ? "space-between" : "center"
  return `<div style="display:flex;align-items:center;justify-content:${justify};width:100%;margin-bottom:20px;">${logos.join("")}</div>`
}

export function renderTemplateHtml(bodyHtml: string, data: SampleCertificateData, options: RenderOptions): string {
  let html = logoHeader(options) + bodyHtml

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
        case "resident_photo":
          replacement = options.requireResidentPhoto ? residentPhotoBox(data.resident_full_name, options.residentPhotoUrl) : ""
          break
        case "barangay_logo":
          replacement = options.showBarangayLogo ? logoSvg(options.barangayLogoUrl, options.logoSize) : ""
          break
        case "municipal_logo":
          replacement = options.showMunicipalLogo ? municipalLogoSvg(options.municipalLogoUrl, options.logoSize, options.municipalityName) : ""
          break
        case "barangay_seal":
          replacement = options.showBarangayDrySeal ? drySealSvg() : ""
          break
        case "captain_signature":
          replacement = signatureBlock(data.barangay_captain, "Barangay Captain")
          break
        case "secretary_signature":
          replacement = signatureBlock(data.barangay_secretary, "Barangay Secretary")
          break
        case "qr_code":
          replacement = qrCodeSvg(data.reference_number)
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
