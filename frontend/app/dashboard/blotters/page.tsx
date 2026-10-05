"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"
import { Archive, Eye, FileSpreadsheet, FileText, Plus, Printer, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BlotterFormDialog } from "@/components/dashboard/blotters/blotter-form-dialog"
import { useAllBlotters, useArchiveBlotter, useDeleteBlotter } from "@/lib/api/hooks/use-blotters"
import { formatDate } from "@/lib/format"
import type { Blotter, BlotterStatus } from "@/types"

const STATUSES: (BlotterStatus | "all")[] = ["all", "Open", "Under Mediation", "Settled", "Escalated to Court", "Closed", "Archived"]

export default function BlottersPage() {
  const router = useRouter()
  const { blotters } = useAllBlotters()
  const archiveBlotter = useArchiveBlotter()
  const deleteBlotter = useDeleteBlotter()

  const [statusFilter, setStatusFilter] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const filtered = React.useMemo(
    () => (statusFilter === "all" ? blotters : blotters.filter((b) => b.status === statusFilter)),
    [blotters, statusFilter]
  )

  const columns = React.useMemo<ColumnDef<Blotter>[]>(
    () => [
      {
        accessorKey: "caseNumber",
        header: "Case No.",
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-xs font-semibold text-primary">{row.original.caseNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      { accessorKey: "incidentType", header: "Incident Type" },
      {
        id: "parties",
        header: "Parties",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="text-foreground">{row.original.complainantName} <span className="text-muted-foreground">vs.</span> {row.original.respondentName}</p>
          </div>
        ),
      },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/blotters/${row.original.id}`)}
            >
              <Eye className="size-3.5" />
              View
            </Button>
            <RowActions
              actions={[
                { label: "Print Case Record", icon: Printer, onClick: () => router.push(`/dashboard/blotter-templates?blotterId=${row.original.id}`) },
                { label: "Export as PDF", icon: FileText, onClick: () => toast.success("Exporting case record to PDF...") },
                { label: "Export as Excel", icon: FileSpreadsheet, onClick: () => toast.success("Exporting case record to Excel...") },
                { label: "Archive Case", icon: Archive, separatorBefore: true, onClick: () => archiveBlotter.mutate(row.original.id) },
                { label: "Delete Case", icon: Trash2, destructive: true, onClick: () => setDeletingId(row.original.id) },
              ]}
            />
          </div>
        ),
      },
    ],
    [archiveBlotter, router]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blotter"
        description="Record and manage barangay dispute mediation cases."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            File New Case
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by case no., complainant, respondent..."
        emptyTitle="No blotter cases found"
        emptyDescription="Try adjusting your filters or file a new case."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <BlotterFormDialog open={formOpen} onOpenChange={setFormOpen} blotter={undefined} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Blotter Case"
        description="This will permanently remove this case record. This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteBlotter.mutate(deletingId)
        }}
      />
    </div>
  )
}
