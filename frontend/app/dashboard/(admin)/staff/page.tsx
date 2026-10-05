"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"
import { KeyRound, Pencil, Plus, Power, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaffFormDialog } from "@/components/dashboard/staff/staff-form-dialog"
import { StaffPasswordDialog } from "@/components/dashboard/staff/staff-password-dialog"
import { useStaff, useDeleteStaff, useToggleStaffStatus } from "@/lib/api/hooks/use-staff"
import { formatRelativeTime } from "@/lib/format"
import type { StaffMember } from "@/types"

export default function StaffAccountsPage() {
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState("")
  const { staffMembers, total, isLoading } = useStaff({ page: pageIndex + 1, pageSize, search })
  const deleteStaff = useDeleteStaff()
  const toggleStatus = useToggleStaffStatus()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<StaffMember | undefined>()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [passwordTarget, setPasswordTarget] = React.useState<StaffMember | undefined>()

  const columns = React.useMemo<ColumnDef<StaffMember>[]>(
    () => [
      {
        id: "name",
        header: "Staff Member",
        accessorFn: (s) => s.name,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={row.original.name} size="sm" />
            <div>
              <p className="font-medium text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "position", header: "Position" },
      { id: "role", header: "Role", cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge> },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "lastLogin",
        header: "Last Login",
        cell: ({ row }) =>
          row.original.lastLogin ? (
            <span suppressHydrationWarning>{formatRelativeTime(row.original.lastLogin)}</span>
          ) : (
            "Never"
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => { setEditing(row.original); setFormOpen(true) } },
              {
                label: row.original.status === "Active" ? "Disable Account" : "Enable Account",
                icon: Power,
                onClick: () => {
                  const wasActive = row.original.status === "Active"
                  toggleStatus.mutate(row.original.id, {
                    onSuccess: () => toast.success(`Account ${wasActive ? "disabled" : "enabled"}.`),
                  })
                },
              },
              {
                label: "Change Password",
                icon: KeyRound,
                onClick: () => setPasswordTarget(row.original),
              },
              { label: "Delete Account", icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeletingId(row.original.id) },
            ]}
          />
        ),
      },
    ],
    [toggleStatus]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Accounts"
        description="Manage staff and administrator accounts for the system."
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <Plus className="size-4" />
            Add Staff
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={staffMembers}
        searchPlaceholder="Search by name, email, position..."
        emptyTitle="No staff accounts found"
        server={{
          pageIndex,
          pageSize,
          totalRows: total,
          onPageIndexChange: setPageIndex,
          onPageSizeChange: (size) => { setPageSize(size); setPageIndex(0) },
          search,
          onSearchChange: (value) => { setSearch(value); setPageIndex(0) },
          isLoading,
        }}
      />

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} staff={editing} />

      <StaffPasswordDialog open={!!passwordTarget} onOpenChange={(open) => !open && setPasswordTarget(undefined)} staff={passwordTarget} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Staff Account"
        description="This will permanently remove this staff account and revoke their access to the system."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteStaff.mutate(deletingId)
        }}
      />
    </div>
  )
}
