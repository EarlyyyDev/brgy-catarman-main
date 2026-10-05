"use client"

import * as React from "react"
import { buildSampleBlotterData, renderBlotterTemplateHtml, type SampleBlotterData } from "@/lib/blotter-placeholders"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { usePublicOfficials } from "@/lib/api/hooks/use-officials"
import { cn } from "@/lib/utils"
import type { BlotterHearing } from "@/types"

interface BlotterPreviewPaperProps {
  bodyHtml: string
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  /** Real data for an actual filed blotter case. Omit to preview the
   * template with fabricated sample data (the Template Builder's use case). */
  data?: SampleBlotterData
  hearings?: BlotterHearing[]
  className?: string
}

export const BlotterPreviewPaper = React.forwardRef<HTMLDivElement, BlotterPreviewPaperProps>(function BlotterPreviewPaper(
  { bodyHtml, showBarangayLogo, showMunicipalLogo, showBarangayDrySeal, logoSize, data, hearings, className },
  ref
) {
  const { settings } = usePublicSettings()
  const { officials } = usePublicOfficials()

  const rendered = React.useMemo(
    () =>
      renderBlotterTemplateHtml(bodyHtml, data ?? buildSampleBlotterData(officials, settings), {
        showBarangayLogo,
        showMunicipalLogo,
        showBarangayDrySeal,
        logoSize,
        barangayLogoUrl: settings.documentLogoUrl,
        municipalLogoUrl: settings.municipalLogoUrl,
        municipalityName: settings.municipality,
        hearings: hearings ?? [],
      }),
    [bodyHtml, officials, settings, data, showBarangayLogo, showMunicipalLogo, showBarangayDrySeal, logoSize, hearings]
  )

  return (
    <div
      ref={ref}
      id="blotter-preview-paper"
      className={cn("mx-auto min-h-[297mm] w-[210mm] max-w-none bg-white p-[18mm] text-[13px] leading-relaxed text-[#0a1930]", "cert-document", className)}
      style={{ fontFamily: "Georgia, serif" }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
})
