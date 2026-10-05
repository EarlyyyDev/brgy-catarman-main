"use client"

import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CertificatePreviewPaper } from "@/components/dashboard/certificate-templates/certificate-preview-paper"
import { ScaledDocumentPreview } from "@/components/shared/scaled-document-preview"
import type { SampleCertificateData } from "@/lib/certificate-placeholders"
import type { CertificateTemplateType } from "@/types"

interface CertificatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bodyHtml: string
  type: CertificateTemplateType
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  data?: SampleCertificateData
  residentPhotoUrl?: string
}

export function CertificatePreviewDialog({
  open,
  onOpenChange,
  bodyHtml,
  type,
  requireResidentPhoto,
  showBarangayLogo,
  showMunicipalLogo,
  showBarangayDrySeal,
  logoSize,
  data,
  residentPhotoUrl,
}: CertificatePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-screen sm:max-w-none"
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
          <DialogTitle>Live Certificate Preview</DialogTitle>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close preview">
            <X className="size-5" />
          </Button>
        </DialogHeader>
        <div className="min-w-0 flex-1 overflow-y-auto bg-secondary/30 p-4">
          <ScaledDocumentPreview>
            <CertificatePreviewPaper
              bodyHtml={bodyHtml}
              type={type}
              requireResidentPhoto={requireResidentPhoto}
              showBarangayLogo={showBarangayLogo}
              showMunicipalLogo={showMunicipalLogo}
              showBarangayDrySeal={showBarangayDrySeal}
              logoSize={logoSize}
              data={data}
              residentPhotoUrl={residentPhotoUrl}
              className="shadow-lg"
            />
          </ScaledDocumentPreview>
        </div>
      </DialogContent>
    </Dialog>
  )
}
