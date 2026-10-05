export type CertificateTemplateType =
  | "Certificate of Residency"
  | "Certificate of Indigency"
  | "Barangay Clearance"
  | "Business Clearance"
  | "Certificate of Good Moral Character"
  | "Senior Citizen Certificate"
  | "Solo Parent Certificate"
  | "Others"

export type CertificateTemplateStatus = "Active" | "Inactive"

export interface CertificateTemplate {
  id: string
  name: string
  type: CertificateTemplateType
  status: CertificateTemplateStatus
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
  createdAt: string
  updatedAt: string
}

export interface CertificateTemplateFormValues {
  name: string
  type: CertificateTemplateType
  status: CertificateTemplateStatus
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
}
