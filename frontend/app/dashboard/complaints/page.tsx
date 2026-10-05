"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComplaintDetailDialog } from "@/components/dashboard/complaints/complaint-detail-dialog"
import { useAllComplaints } from "@/lib/api/hooks/use-complaints"
import { INCIDENT_CATEGORIES } from "@/data/complaints"
import { formatDate } from "@/lib/format"
import type { Complaint, ComplaintStatus } from "@/types"

const STATUSES: (ComplaintStatus | "all")[] = ["all", "New", "Under Review", "Validated", "Resolved", "Dismissed", "Archived"]

export default function ComplaintsPage() {
  const { complaints } = useAllComplaints()
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [selected, setSelected] = React.useState<Complaint | undefined>()
  const [detailOpen, setDetailOpen] = React.useState(false)

  const filtered = React.useMemo(
    () =>
      complaints.filter((c) => {
        const matchesStatus = statusFilter === "all" || c.status === statusFilter
        const matchesCategory = categoryFilter === "all" || c.category === categoryFilter
        return matchesStatus && matchesCategory
      }),
    [complaints, statusFilter, categoryFilter]
  )

  const columns = React.useMemo<ColumnDef<Complaint>[]>(
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
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (row.original.category === "Other" ? row.original.otherCategoryLabel : row.original.category),
      },
      {
        id: "reporter",
        header: "Reporter",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <InitialsAvatar name={row.original.reporterName} size="sm" />
            <span className="text-sm">{row.original.reporterName}</span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.location}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(row.original)
              setDetailOpen(true)
            }}
          >
            <Eye className="size-3.5" />
            View
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints" description="Review and act on incident reports submitted by residents." />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by reference no., reporter, location..."
        emptyTitle="No complaints found"
        emptyDescription="Try adjusting your filters."
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {INCIDENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <ComplaintDetailDialog open={detailOpen} onOpenChange={setDetailOpen} complaint={selected} />
    </div>
  )
}
