"use client"

import * as React from "react"
import { Archive, Check, Eye, MapPin, ShieldX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline } from "@/components/shared/timeline"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import { useUpdateComplaintStatus } from "@/lib/api/hooks/use-complaints"
import { formatDate } from "@/lib/format"
import type { Complaint } from "@/types"

export function ComplaintDetailDialog({ open, onOpenChange, complaint }: { open: boolean; onOpenChange: (open: boolean) => void; complaint?: Complaint }) {
  const updateStatus = useUpdateComplaintStatus()
  const [notes, setNotes] = React.useState("")
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) setNotes(complaint?.staffNotes ?? "")
  }, [open, complaint])

  if (!complaint) return null

  async function handleAction(status: Complaint["status"]) {
    await updateStatus.mutateAsync({ id: complaint!.id, status, staffNotes: notes || undefined })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle>{complaint.referenceNumber}</DialogTitle>
            <StatusBadge status={complaint.status} className="shrink-0" />
          </div>
          <DialogDescription>
            {complaint.category === "Other" ? complaint.otherCategoryLabel : complaint.category} · Reported {formatDate(complaint.submittedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reporter (Confidential)</p>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              {complaint.reporterPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(complaint.reporterPhotoUrl!)}
                  className="shrink-0 cursor-zoom-in transition-opacity hover:opacity-80"
                  aria-label="View full-size reporter photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={complaint.reporterPhotoUrl} alt="Reporter verification" className="size-16 rounded-lg object-cover" />
                </button>
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Eye className="size-5" />
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold text-foreground">{complaint.reporterName}</p>
                <p className="text-xs text-muted-foreground">{complaint.reporterPhone}</p>
                <p className="text-xs text-muted-foreground">{complaint.reporterEmail}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reported Person</p>
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium text-foreground">{complaint.reportedPerson || "Unidentified / Unknown"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {complaint.location}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(complaint.incidentDate)} at {complaint.incidentTime}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-foreground">{complaint.description}</p>
        </div>

        {complaint.evidenceUrls.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {complaint.evidenceUrls.map((url, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={idx} src={url} alt={`Evidence ${idx + 1}`} className="aspect-square w-full rounded-lg border border-border object-cover" />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
            <Badge variant="outline">No evidence photos submitted</Badge>
          </div>
        )}

        <div>
          <Label>Staff Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes about this case..." rows={3} className="mt-2" />
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</p>
          <Timeline events={complaint.timeline} />
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {complaint.status === "New" ? (
              <Button variant="outline" onClick={() => handleAction("Under Review")}>
                Start Review
              </Button>
            ) : null}
            {(complaint.status === "New" || complaint.status === "Under Review") ? (
              <Button variant="outline" onClick={() => handleAction("Validated")}>
                <Check className="size-4" />
                Validate
              </Button>
            ) : null}
            {complaint.status !== "Resolved" && complaint.status !== "Dismissed" ? (
              <Button onClick={() => handleAction("Resolved")}>
                <Check className="size-4" />
                Resolve
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleAction("Dismissed")}>
              <ShieldX className="size-4" />
              Dismiss
            </Button>
            <Button variant="outline" onClick={() => handleAction("Archived")}>
              <Archive className="size-4" />
              Archive
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {lightboxUrl ? <ImageLightbox url={lightboxUrl} alt="Reporter verification" onClose={() => setLightboxUrl(null)} /> : null}
    </Dialog>
  )
}
