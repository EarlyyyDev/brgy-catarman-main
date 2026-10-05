"use client"

import * as React from "react"
import { FileText, IdCard, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import type { CertificateRequest, UploadedFile } from "@/types"

interface RequirementItem {
  label: string
  name: string
  url: string
  mimeType: string
  sizeKb?: number
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/")
}

function hasPreviewableSrc(item: RequirementItem) {
  return isImage(item.mimeType) && item.url.length > 0
}

function RequirementCard({ item, onView }: { item: RequirementItem; onView: () => void }) {
  return (
    <button
      type="button"
      onClick={onView}
      className="group flex flex-col overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary/40"
    >
      <div className="flex aspect-video items-center justify-center bg-muted">
        {hasPreviewableSrc(item) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="size-full object-cover transition-transform group-hover:scale-105" />
        ) : isImage(item.mimeType) ? (
          <ImageIcon className="size-8 text-muted-foreground" />
        ) : (
          <FileText className="size-8 text-muted-foreground" />
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.label}</p>
        <p className="truncate text-sm text-foreground">{item.name}</p>
        {item.sizeKb ? <p className="text-xs text-muted-foreground">{item.sizeKb} KB</p> : null}
      </div>
    </button>
  )
}

export function CertificateRequirementsDialog({
  open,
  onOpenChange,
  request,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  request?: CertificateRequest
}) {
  const [viewing, setViewing] = React.useState<RequirementItem | null>(null)

  React.useEffect(() => {
    if (!open) setViewing(null)
  }, [open])

  if (!request) return null

  const items: RequirementItem[] = []

  if (request.residentPhotoUrl) {
    items.push({ label: "Identity Verification Photo", name: "Live capture at submission", url: request.residentPhotoUrl, mimeType: "image/*" })
  }
  request.requirements.forEach((f: UploadedFile) => {
    items.push({ label: "Requirement", name: f.name, url: f.url, mimeType: f.mimeType, sizeKb: f.sizeKb })
  })
  if (request.representativeIdUrl) {
    items.push({ label: "Representative's ID", name: "Representative ID photo", url: request.representativeIdUrl, mimeType: "image/*" })
  }
  if (request.authorizationLetter) {
    items.push({
      label: "Authorization Letter",
      name: request.authorizationLetter.name,
      url: request.authorizationLetter.url,
      mimeType: request.authorizationLetter.mimeType,
      sizeKb: request.authorizationLetter.sizeKb,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="size-4.5" />
            Submitted Requirements
          </DialogTitle>
          <DialogDescription>
            {request.requestorName} · {request.referenceNumber} · {request.documentType}
          </DialogDescription>
        </DialogHeader>

        {viewing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{viewing.label}</p>
              <button type="button" onClick={() => setViewing(null)} className="text-sm text-primary hover:underline">
                Back to list
              </button>
            </div>
            <div className={cn("flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted", !hasPreviewableSrc(viewing) && "p-8")}>
              {hasPreviewableSrc(viewing) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewing.url} alt="" className="max-h-[60vh] w-full object-contain" />
              ) : viewing.url ? (
                <a href={viewing.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 text-primary hover:underline">
                  <FileText className="size-10" />
                  Open {viewing.name}
                </a>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {isImage(viewing.mimeType) ? <ImageIcon className="size-10" /> : <FileText className="size-10" />}
                  <p className="text-sm">{viewing.name}</p>
                  <p className="text-xs">File content not available for this record.</p>
                </div>
              )}
            </div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No requirements attached"
            description="This request has no uploaded requirement files on record (common for walk-in requests verified in person)."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, i) => (
              <RequirementCard key={i} item={item} onView={() => setViewing(item)} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
