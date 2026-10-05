"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActivityLogs } from "@/lib/api/hooks/use-activity-logs"
import { formatDateTime } from "@/lib/format"
import type { ActivityLog } from "@/types"

const MODULES: (ActivityLog["module"] | "all")[] = [
  "all",
  "Authentication",
  "Residents",
  "Households",
  "Certificates",
  "Complaints",
  "Blotters",
  "Announcements",
  "Settings",
  "Backup",
  "Staff",
]

export default function ActivityLogsPage() {
  const { activityLogs } = useActivityLogs()
  const [moduleFilter, setModuleFilter] = React.useState<string>("all")

  const filtered = React.useMemo(
    () => (moduleFilter === "all" ? activityLogs : activityLogs.filter((l) => l.module === moduleFilter)),
    [activityLogs, moduleFilter]
  )

  const columns = React.useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        id: "actor",
        header: "User",
        accessorFn: (l) => l.actorName,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <InitialsAvatar name={row.original.actorName} size="sm" />
            <div>
              <p className="text-sm font-medium text-foreground">{row.original.actorName}</p>
              <p className="text-xs text-muted-foreground">{row.original.actorRole}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "action", header: "Action" },
      { id: "module", header: "Module", cell: ({ row }) => <Badge variant="outline">{row.original.module}</Badge> },
      { id: "status", header: "Result", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "ipAddress", header: "IP Address", cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress}</span> },
      { accessorKey: "browser", header: "Browser", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.browser}</span> },
      { id: "timestamp", header: "Timestamp", cell: ({ row }) => <span className="text-xs">{formatDateTime(row.original.timestamp)}</span> },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="Audit trail of all significant actions performed within the system." />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by user, action, description..."
        emptyTitle="No activity logs found"
        pageSize={20}
        toolbar={
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === "all" ? "All Modules" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
