"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { type ColumnDef } from "@tanstack/react-table"
import { Clock, Database, Download, HardDriveDownload, RotateCcw, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useBackups, useRunManualBackup, useRestoreBackup, backupDownloadUrl } from "@/lib/api/hooks/use-backups"
import { formatDateTime } from "@/lib/format"
import type { BackupRecord } from "@/types"

export default function BackupPage() {
  const { backupRecords } = useBackups()
  const runManualBackup = useRunManualBackup()
  const restoreBackup = useRestoreBackup()

  const [autoBackup, setAutoBackup] = React.useState(true)
  const [restoring, setRestoring] = React.useState<BackupRecord | null>(null)

  const lastBackup = backupRecords[0]

  async function handleManualBackup() {
    await runManualBackup.mutateAsync()
  }

  const columns = React.useMemo<ColumnDef<BackupRecord>[]>(
    () => [
      { accessorKey: "fileName", header: "File Name", cell: ({ row }) => <span className="font-mono text-xs">{row.original.fileName}</span> },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "sizeMb", header: "Size", cell: ({ row }) => `${row.original.sizeMb} MB` },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "createdBy", header: "Created By" },
      { id: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <a href={backupDownloadUrl(row.original.id)} download>
                <Download className="size-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={row.original.status !== "Completed"}
              onClick={() => setRestoring(row.original)}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Backup & Restore" description="Manage database backups and disaster recovery." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Backups" value={backupRecords.length} icon={Database} accent="navy" />
        <StatCard label="Last Backup" value={lastBackup ? formatDateTime(lastBackup.createdAt) : "—"} icon={Clock} accent="gold" />
        <StatCard label="Backup Status" value={lastBackup?.status ?? "—"} icon={ShieldCheck} accent={lastBackup?.status === "Completed" ? "success" : "danger"} />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Backup Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={autoBackup} onCheckedChange={(checked) => { setAutoBackup(checked); toast.success(`Automatic backup ${checked ? "enabled" : "disabled"}.`) }} />
            <div>
              <Label>Automatic Nightly Backup</Label>
              <p className="text-xs text-muted-foreground">Runs automatically every day at 3:00 AM.</p>
            </div>
          </div>
          <Button onClick={handleManualBackup} disabled={runManualBackup.isPending}>
            <HardDriveDownload className="size-4" />
            {runManualBackup.isPending ? "Running Backup..." : "Run Manual Backup Now"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Backup History</p>
        <DataTable columns={columns} data={backupRecords} searchPlaceholder="Search backups..." emptyTitle="No backups found" />
      </div>

      <ConfirmDialog
        open={!!restoring}
        onOpenChange={(open) => !open && setRestoring(null)}
        title="Restore from Backup"
        description={`This will restore the system to the state captured in "${restoring?.fileName}". Any data created after this backup will be lost. This action cannot be undone.`}
        destructive
        confirmLabel="Restore System"
        onConfirm={() => {
          if (restoring) restoreBackup.mutate(restoring.id)
        }}
      />
    </div>
  )
}
