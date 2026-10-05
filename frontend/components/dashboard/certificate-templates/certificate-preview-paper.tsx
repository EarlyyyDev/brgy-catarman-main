"use client"

import * as React from "react"
import { buildSampleData, renderTemplateHtml, type SampleCertificateData } from "@/lib/certificate-placeholders"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { usePublicOfficials } from "@/lib/api/hooks/use-officials"
import { cn } from "@/lib/utils"
import type { CertificateTemplateType } from "@/types"

interface CertificatePreviewPaperProps {
  bodyHtml: string
  type: CertificateTemplateType
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  /** Real data for an actual issued certificate. Omit to preview the
   * template with fabricated sample data (the Template Builder's use case). */
  data?: SampleCertificateData
  residentPhotoUrl?: string
  className?: string
}

export const CertificatePreviewPaper = React.forwardRef<HTMLDivElement, CertificatePreviewPaperProps>(function CertificatePreviewPaper(
  { bodyHtml, type, requireResidentPhoto, showBarangayLogo, showMunicipalLogo, showBarangayDrySeal, logoSize, data, residentPhotoUrl, className },
  ref
) {
  const { settings } = usePublicSettings()
  const { officials } = usePublicOfficials()

  const rendered = React.useMemo(
    () =>
      renderTemplateHtml(bodyHtml, data ?? buildSampleData(type, officials, settings), {
        requireResidentPhoto,
        showBarangayLogo,
        showMunicipalLogo,
        showBarangayDrySeal,
        logoSize,
        barangayLogoUrl: settings.documentLogoUrl,
        municipalLogoUrl: settings.municipalLogoUrl,
        municipalityName: settings.municipality,
        residentPhotoUrl,
      }),
    [bodyHtml, type, officials, settings, data, requireResidentPhoto, showBarangayLogo, showMunicipalLogo, showBarangayDrySeal, logoSize, residentPhotoUrl]
  )

  return (
    <div
      ref={ref}
      id="certificate-preview-paper"
      className={cn("mx-auto min-h-[297mm] w-[210mm] max-w-none bg-white p-[18mm] text-[13px] leading-relaxed text-[#0F172A]", "cert-document", className)}
      style={{ fontFamily: "Georgia, serif" }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
})
