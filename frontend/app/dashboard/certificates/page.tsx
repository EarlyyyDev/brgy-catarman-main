"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import {
  CalendarPlus,
  Check,
  Eye,
  FileCheck,
  FileClock,
  FilePlus2,
  IdCard,
  Printer,
  Trash2,
  UserRoundCheck,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { RowActions, type RowAction } from "@/components/shared/row-actions"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CertificateActionDialog, type CertificateActionType } from "@/components/dashboard/certificates/certificate-action-dialog"
import { CertificateRequirementsDialog } from "@/components/dashboard/certificates/certificate-requirements-dialog"
import { useAllCertificateRequests, useDeleteCertificateRequest } from "@/lib/api/hooks/use-certificate-requests"
import { DOCUMENT_TYPES } from "@/data/certificates"
import { formatDate } from "@/lib/format"
import type { CertificateRequest, CertificateStatus } from "@/types"

const STATUS_FILTERS: (CertificateStatus | "all")[] = [
  "all",
  "Pending",
  "Processing",
  "Approved",
  "Rejected",
  "Ready for Claim",
  "Claimed",
]

export default function CertificatesPage() {
  const router = useRouter()
  const { certificateRequests } = useAllCertificateRequests()
  const deleteCertificateRequest = useDeleteCertificateRequest()
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [docTypeFilter, setDocTypeFilter] = React.useState<string>("all")
  const [actionState, setActionState] = React.useState<{ action: CertificateActionType; request: CertificateRequest } | null>(null)
  const [requirementsRequest, setRequirementsRequest] = React.useState<CertificateRequest | null>(null)
  const [deletingRequest, setDeletingRequest] = React.useState<CertificateRequest | null>(null)

  const filtered = React.useMemo(
    () =>
      certificateRequests.filter((r) => {
        const matchesStatus = statusFilter === "all" || r.status === statusFilter
        const matchesDoc = docTypeFilter === "all" || r.documentType === docTypeFilter
        return matchesStatus && matchesDoc
      }),
    [certificateRequests, statusFilter, docTypeFilter]
  )

  const columns = React.useMemo<ColumnDef<CertificateRequest>[]>(
    () => [
      {
        accessorKey: "referenceNumber",
        header: "Reference No.",
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-xs font-semibold text-primary">{row.original.referenceNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.original.submittedAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: "requestorName",
        header: "Requestor",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.requestorName}</p>
            <p className="text-xs text-muted-foreground">{row.original.documentType}</p>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => <Badge variant="outline">{row.original.channel}</Badge>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "claimDeadline",
        header: "Claim Deadline",
        cell: ({ row }) => (row.original.claimDeadline ? formatDate(row.original.claimDeadline) : "—"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const request = row.original
          const actions: RowAction[] = []

          actions.push({ label: "See Requirements", icon: IdCard, onClick: () => setRequirementsRequest(request) })

          if (request.status === "Pending") {
            actions.push({ label: "Start Review", icon: FileClock, onClick: () => setActionState({ action: "review", request }) })
          }
          if (request.status === "Pending" || request.status === "Processing") {
            actions.push({ label: "Approve", icon: Check, onClick: () => setActionState({ action: "approve", request }) })
            actions.push({ label: "Reject", icon: XCircle, destructive: true, onClick: () => setActionState({ action: "reject", request }) })
          }
          if (request.status === "Approved") {
            actions.push({ label: "Mark Ready for Claim", icon: FileCheck, onClick: () => setActionState({ action: "ready", request }) })
          }
          if (request.status === "Ready for Claim") {
            actions.push({ label: "Mark Claimed", icon: UserRoundCheck, onClick: () => setActionState({ action: "claimed", request }) })
            actions.push({ label: "Extend Deadline", icon: CalendarPlus, onClick: () => setActionState({ action: "extend", request }) })
          }
          actions.push({
            label: "Print Certificate",
            icon: Printer,
            separatorBefore: true,
            onClick: () => router.push(`/dashboard/certificate-templates?requestId=${request.id}`),
          })
          actions.push({
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: () => setDeletingRequest(request),
          })

          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push(`/dashboard/certificate-templates?requestId=${request.id}`)}>
                <Eye className="size-4" />
              </Button>
              <RowActions actions={actions} />
            </div>
          )
        },
      },
    ],
    [router]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Requests"
        description="Review, process, and issue barangay certificates and clearances."
        actions={
          <Button onClick={() => router.push("/dashboard/certificates/walk-in")}>
            <FilePlus2 className="size-4" />
            Encode Walk-in Request
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by reference no., requestor..."
        emptyTitle="No certificate requests found"
        emptyDescription="Try adjusting your filters."
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Document Types</SelectItem>
                {DOCUMENT_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <CertificateActionDialog
        open={!!actionState}
        onOpenChange={(open) => !open && setActionState(null)}
        action={actionState?.action ?? null}
        request={actionState?.request}
      />

      <CertificateRequirementsDialog
        open={!!requirementsRequest}
        onOpenChange={(open) => !open && setRequirementsRequest(null)}
        request={requirementsRequest ?? undefined}
      />

      <ConfirmDialog
        open={!!deletingRequest}
        onOpenChange={(open) => !open && setDeletingRequest(null)}
        title="Delete Certificate Request"
        description={
          deletingRequest
            ? `This will permanently remove request ${deletingRequest.referenceNumber} (${deletingRequest.requestorName}). This cannot be undone.`
            : ""
        }
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingRequest) deleteCertificateRequest.mutate(deletingRequest.id)
        }}
      />
    </div>
  )
}
