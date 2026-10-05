"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Archive, ArrowLeft, Pencil, Printer, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline } from "@/components/shared/timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { BlotterFormDialog } from "@/components/dashboard/blotters/blotter-form-dialog"
import { CaseHearingsPanel } from "@/components/dashboard/blotters/case-hearings-panel"
import {
  useAllBlotters,
  useUpdateBlotterStatus,
  useArchiveBlotter,
  useDeleteBlotter,
  useAddCaseNote,
} from "@/lib/api/hooks/use-blotters"
import { formatDate } from "@/lib/format"
import type { BlotterStatus } from "@/types"

const STATUSES: BlotterStatus[] = ["Open", "Under Mediation", "Settled", "Escalated to Court", "Closed"]

export default function BlotterCasePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { blotters } = useAllBlotters()
  const updateStatus = useUpdateBlotterStatus()
  const archiveBlotter = useArchiveBlotter()
  const deleteBlotter = useDeleteBlotter()
  const addCaseNote = useAddCaseNote()

  const blotter = blotters.find((b) => b.id === params.id)

  const [status, setStatus] = React.useState<BlotterStatus>("Open")
  const [resolution, setResolution] = React.useState("")
  const [note, setNote] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    if (blotter) {
      setStatus(blotter.status === "Archived" ? "Closed" : blotter.status)
      setResolution(blotter.resolution ?? "")
    }
  }, [blotter])

  if (!blotter) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/blotters")}>
          <ArrowLeft className="size-4" />
          Back to Blotter
        </Button>
        <EmptyState icon={ShieldAlert} title="Case not found" description="This blotter case may have been deleted." />
      </div>
    )
  }

  function saveCaseStatus() {
    updateStatus.mutate({ id: blotter!.id, status, resolution: resolution || undefined })
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault()
    const value = note.trim()
    if (!value) return
    await addCaseNote.mutateAsync({ id: blotter!.id, note: value })
    setNote("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push("/dashboard/blotters")}>
          <ArrowLeft className="size-4" />
          Back to Blotter
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Pencil className="size-4" />
            Edit Case
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/blotter-templates?blotterId=${blotter.id}`)}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => archiveBlotter.mutate(blotter.id)}>
            <Archive className="size-4" />
            Archive
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{blotter.caseNumber}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">{blotter.incidentType}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filed {formatDate(blotter.createdAt)} · {blotter.complainantName} vs. {blotter.respondentName}
          </p>
        </div>
        <StatusBadge status={blotter.status} className="text-sm" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complainant</p>
                <p className="mt-1 text-sm font-medium text-foreground">{blotter.complainantName}</p>
                <p className="text-xs text-muted-foreground">{blotter.complainantAddress}</p>
                <p className="text-xs text-muted-foreground">{blotter.complainantContact}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondent</p>
                <p className="mt-1 text-sm font-medium text-foreground">{blotter.respondentName}</p>
                <p className="text-xs text-muted-foreground">{blotter.respondentAddress}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incident Details</p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(blotter.incidentDate)} · {blotter.location}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Narrative</p>
                <p className="mt-1.5 rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">{blotter.narrative}</p>
              </div>
              {blotter.resolution ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resolution</p>
                  <p className="mt-1.5 rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">{blotter.resolution}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <CaseHearingsPanel blotter={blotter} />

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Case History</p>
            <Timeline events={[...blotter.history].reverse()} />

            <form onSubmit={submitNote} className="mt-5 space-y-2 border-t border-border pt-4">
              <Label>Add a Case Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Log a follow-up call, an update from a party, or any other case activity..."
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!note.trim()}>
                  Add Note
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Case Status</p>
            <div className="mt-3 space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as BlotterStatus)}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mediator</Label>
                <p className="mt-1.5 text-sm text-muted-foreground">{blotter.mediator || "Not yet assigned"}</p>
              </div>
              <div>
                <Label>Resolution / Notes</Label>
                <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} className="mt-1.5" placeholder="Document resolution details..." />
              </div>
              <Button className="w-full" onClick={saveCaseStatus}>
                Update Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BlotterFormDialog open={formOpen} onOpenChange={setFormOpen} blotter={blotter} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Blotter Case"
        description="This will permanently remove this case record. This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          deleteBlotter.mutate(blotter.id, { onSuccess: () => router.push("/dashboard/blotters") })
        }}
      />
    </div>
  )
}
