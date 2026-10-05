"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCertificateStatus } from "@/lib/api/hooks/use-certificate-requests"
import type { CertificateRequest, CertificateStatus } from "@/types"

export type CertificateActionType = "review" | "approve" | "reject" | "ready" | "claimed" | "extend"

const ACTION_META: Record<CertificateActionType, { title: string; description: string; status?: CertificateStatus; confirmLabel: string; destructive?: boolean }> = {
  review: { title: "Move to Processing", description: "Mark this request as currently being processed by staff.", status: "Processing", confirmLabel: "Confirm" },
  approve: { title: "Approve Request", description: "Approve this certificate request and generate a control number and claim deadline.", status: "Approved", confirmLabel: "Approve" },
  reject: { title: "Reject Request", description: "Please provide a reason for rejecting this request.", status: "Rejected", confirmLabel: "Reject Request", destructive: true },
  ready: { title: "Mark Ready for Claim", description: "Notify the requestor that their document is ready for pickup.", status: "Ready for Claim", confirmLabel: "Confirm" },
  claimed: { title: "Mark as Claimed", description: "Confirm that the requestor has claimed this document.", status: "Claimed", confirmLabel: "Confirm" },
  extend: { title: "Extend Claim Deadline", description: "Extend the claim deadline for this request.", confirmLabel: "Extend Deadline" },
}

interface CertificateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: CertificateActionType | null
  request?: CertificateRequest
}

export function CertificateActionDialog({ open, onOpenChange, action, request }: CertificateActionDialogProps) {
  const updateStatus = useUpdateCertificateStatus()
  const [reason, setReason] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [extendDays, setExtendDays] = React.useState("3")

  React.useEffect(() => {
    if (open) {
      setReason("")
      setNotes("")
      setExtendDays("3")
    }
  }, [open, action])

  if (!action || !request) return null
  const meta = ACTION_META[action]

  async function handleConfirm() {
    if (!request) return
    if (action === "extend") {
      await updateStatus.mutateAsync({ id: request.id, status: request.status, extra: { extendDays: Number(extendDays) || 0 } })
    } else {
      await updateStatus.mutateAsync({
        id: request.id,
        status: meta.status!,
        extra: { rejectionReason: action === "reject" ? reason : undefined, staffNotes: notes || undefined },
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{request.referenceNumber}</p>
          <p className="text-muted-foreground">{request.documentType} · {request.requestorName}</p>
        </div>

        {action === "reject" ? (
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Incomplete requirements submitted" rows={3} />
          </div>
        ) : null}

        {action === "extend" ? (
          <div className="space-y-2">
            <Label>Extend by (days)</Label>
            <Input type="number" min={1} value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
          </div>
        ) : null}

        {action === "approve" || action === "review" ? (
          <div className="space-y-2">
            <Label>Staff Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes about this request" rows={3} />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={meta.destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={action === "reject" && !reason.trim()}
          >
            {meta.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
