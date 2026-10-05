import type { CertificateTemplateType, DocumentType } from "@/types"

const DOCUMENT_TYPE_TO_TEMPLATE_TYPE: Partial<Record<DocumentType, CertificateTemplateType>> = {
  "Certificate of Residency": "Certificate of Residency",
  "Certificate of Indigency": "Certificate of Indigency",
  "Barangay Clearance": "Barangay Clearance",
  "Business Clearance": "Business Clearance",
}

export function mapDocumentTypeToTemplateType(documentType: DocumentType): CertificateTemplateType {
  return DOCUMENT_TYPE_TO_TEMPLATE_TYPE[documentType] ?? "Others"
}
