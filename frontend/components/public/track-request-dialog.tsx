"use client"

import * as React from "react"
import { AlertTriangle, CalendarClock, Info, RefreshCcw, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline } from "@/components/shared/timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { useTrackCertificateRequest } from "@/lib/api/hooks/use-certificate-requests"
import { useTrackComplaint } from "@/lib/api/hooks/use-complaints"
import { formatDate, formatRelativeTime } from "@/lib/format"
import type { CertificateRequest } from "@/types"

const CLAIM_INSTRUCTIONS =
  "Please proceed to the Barangay Hall during office hours (Monday - Friday, 8:00 AM - 5:00 PM) and bring a valid government-issued ID and this reference number to claim your document."

function CertificateRequestCard({ request }: { request: CertificateRequest }) {
  return (
    <div className="rounded-lg border border-border p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-bold text-foreground">{request.documentType}</p>
        <StatusBadge status={request.status} className="px-3 py-1 text-sm" />
      </div>

      <div className="mt-4 grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Requestor</p>
          <p className="text-sm font-semibold text-foreground">{request.requestorName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Date Submitted</p>
          <p className="text-sm font-semibold text-foreground">{formatDate(request.submittedAt)}</p>
        </div>
        {request.approvedAt ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Date Approved</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(request.approvedAt)}</p>
          </div>
        ) : null}
        {request.claimDeadline ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Claim Deadline</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarClock className="size-3.5" />
              {formatDate(request.claimDeadline)}
            </p>
          </div>
        ) : null}
        {request.rejectionReason ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Rejection Reason</p>
            <p className="text-sm font-semibold text-destructive">{request.rejectionReason}</p>
          </div>
        ) : null}
      </div>

      {request.status === "Ready for Claim" || request.status === "Approved" ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold-muted/60 p-4 text-sm text-gold-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {CLAIM_INSTRUCTIONS}
        </div>
      ) : null}

      <div className="mt-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status Timeline</p>
        <Timeline events={request.timeline} />
      </div>
    </div>
  )
}

export function TrackRequestDialog({
  open,
  onOpenChange,
  initialRef = "",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRef?: string
}) {
  const [query, setQuery] = React.useState(initialRef)
  const [searched, setSearched] = React.useState(false)
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null)
  const [searchedRef, setSearchedRef] = React.useState("")

  const { result, isLoading: certLoading } = useTrackCertificateRequest(searchedRef || undefined)
  const { complaint, isLoading: complaintLoading } = useTrackComplaint(result ? undefined : searchedRef || undefined)
  const anyLoading = certLoading || complaintLoading

  const found = Boolean(result) || Boolean(complaint)

  const runSearch = React.useCallback((value: string) => {
    if (!value.trim()) return
    setSearchedRef(value.trim())
    setSearched(true)
    setLastChecked(new Date())
  }, [])

  React.useEffect(() => {
    if (open) {
      setQuery(initialRef)
      setSearched(false)
      setSearchedRef("")
      setLastChecked(null)
      if (initialRef.trim()) runSearch(initialRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRef])

  React.useEffect(() => {
    if (!open || !searched || !found) return
    const interval = window.setInterval(() => {
      runSearch(query)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [open, searched, found, query, runSearch])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Track Your Request</DialogTitle>
          <DialogDescription>Enter the reference number you received upon submission to check its current status.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. BC-2026-00123 or INC-2026-00045"
            className="flex-1 uppercase placeholder:normal-case"
          />
          <Button type="submit">
            <Search className="size-4" />
            Track Request
          </Button>
        </form>

        {searched && !anyLoading && !found ? (
          <EmptyState
            icon={AlertTriangle}
            title="No request found"
            description="We couldn't find a request with that reference number. Please double-check and try again."
          />
        ) : null}

        {result ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference Number</p>
              <p className="font-heading text-xl font-bold text-primary">{result.referenceNumber}</p>
              {result.requests.length > 1 ? (
                <p className="mt-1 text-xs text-muted-foreground">{result.requests.length} documents requested together</p>
              ) : null}
            </div>

            {result.requests.map((request) => (
              <CertificateRequestCard key={request.id} request={request} />
            ))}

            {lastChecked ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
                <RefreshCcw className="size-3" />
                Auto-refreshing · Last checked {formatRelativeTime(lastChecked)}
              </div>
            ) : null}
          </div>
        ) : null}

        {!result && complaint ? (
          <div className="rounded-lg border border-border p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference Number</p>
                <p className="font-heading text-xl font-bold text-primary">{complaint.referenceNumber}</p>
              </div>
              <StatusBadge status={complaint.status} className="px-3 py-1 text-sm" />
            </div>

            <div className="mt-6 grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Category</p>
                <p className="text-sm font-semibold text-foreground">{complaint.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Date Reported</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(complaint.submittedAt)}</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status Timeline</p>
              <Timeline events={complaint.timeline} />
            </div>

            {lastChecked ? (
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
                <RefreshCcw className="size-3" />
                Auto-refreshing · Last checked {formatRelativeTime(lastChecked)}
              </div>
            ) : null}
          </div>
        ) : null}

        {!searched ? (
          <p className="text-center text-xs text-muted-foreground">
            Tip: Reference numbers begin with &quot;BC-&quot; for document requests, or &quot;INC-&quot; for incident reports.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
