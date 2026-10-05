import type { CertificateTemplate, CertificateTemplateFormValues, CertificateTemplateType } from "@/types"
import type { BackendDocumentType } from "@/lib/api/hooks/use-document-types"

/** "Others" has no matching DocumentType by that literal name — it aliases
 * the catch-all "Other Barangay Document" type. */
const TEMPLATE_TYPE_TO_DOCTYPE_NAME: Record<CertificateTemplateType, string> = {
  "Certificate of Residency": "Certificate of Residency",
  "Certificate of Indigency": "Certificate of Indigency",
  "Barangay Clearance": "Barangay Clearance",
  "Business Clearance": "Business Clearance",
  "Certificate of Good Moral Character": "Certificate of Good Moral Character",
  "Senior Citizen Certificate": "Senior Citizen Certificate",
  "Solo Parent Certificate": "Solo Parent Certificate",
  Others: "Other Barangay Document",
}

interface BackendCertificateTemplate {
  id: string
  name: string
  documentTypeId: string
  documentType?: { id: string; name: string }
  status: "ACTIVE" | "INACTIVE"
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
  createdAt: string
  updatedAt: string
}

export function documentTypeIdForTemplateType(type: CertificateTemplateType, documentTypes: BackendDocumentType[]): string | undefined {
  const name = TEMPLATE_TYPE_TO_DOCTYPE_NAME[type]
  return documentTypes.find((d) => d.name === name)?.id
}

export function toCertificateTemplatePayload(values: CertificateTemplateFormValues, documentTypes: BackendDocumentType[]) {
  return {
    name: values.name,
    documentTypeId: documentTypeIdForTemplateType(values.type, documentTypes),
    status: values.status === "Active" ? "ACTIVE" : "INACTIVE",
    requireResidentPhoto: values.requireResidentPhoto,
    showBarangayLogo: values.showBarangayLogo,
    showMunicipalLogo: values.showMunicipalLogo,
    showBarangayDrySeal: values.showBarangayDrySeal,
    logoSize: values.logoSize,
    bodyHtml: values.bodyHtml,
  }
}

export function fromCertificateTemplateDto(dto: BackendCertificateTemplate): CertificateTemplate {
  const docTypeName = dto.documentType?.name ?? ""
  const type = (Object.entries(TEMPLATE_TYPE_TO_DOCTYPE_NAME).find(([, v]) => v === docTypeName)?.[0] ??
    "Others") as CertificateTemplateType

  return {
    id: dto.id,
    name: dto.name,
    type,
    status: dto.status === "ACTIVE" ? "Active" : "Inactive",
    requireResidentPhoto: dto.requireResidentPhoto,
    showBarangayLogo: dto.showBarangayLogo,
    showMunicipalLogo: dto.showMunicipalLogo,
    showBarangayDrySeal: dto.showBarangayDrySeal,
    logoSize: dto.logoSize,
    bodyHtml: dto.bodyHtml,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
