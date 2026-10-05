"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { type ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"
import { Download, Eye, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResidentFormDialog } from "@/components/dashboard/residents/resident-form-dialog"
import { useAllResidents, useDeleteResident } from "@/lib/api/hooks/use-residents"
import { useSitios } from "@/lib/api/hooks/use-geography"
import { residentsApi } from "@/lib/api/endpoints"
import { toResidentPayload, tagsToPayload } from "@/lib/api/adapters/resident.adapter"
import { qk } from "@/lib/api/query-keys"
import { CIVIL_STATUSES, RESIDENT_TAGS } from "@/lib/constants"
import { createCsv, downloadCsv, parseCsvRecords } from "@/lib/csv"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import type { Resident, ResidentFormValues, ResidentTagType } from "@/types"

const RESIDENT_CSV_HEADERS = [
  "firstName", "middleName", "lastName", "suffix", "gender", "birthdate", "civilStatus", "sitioPurok", "street",
  "houseNumber", "contactNumber", "email", "religion", "occupation", "educationalAttainment", "emergencyContactName",
  "emergencyContactNumber", "isRegisteredVoter", "tags",
] as const

function parseCsvBoolean(value: string | undefined) {
  return ["true", "yes", "1"].includes((value ?? "").trim().toLowerCase())
}

export default function ResidentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { residents } = useAllResidents()
  const { puroks } = useSitios()
  const deleteResident = useDeleteResident()
  const importInputRef = React.useRef<HTMLInputElement>(null)

  const [purokFilter, setPurokFilter] = React.useState<string>("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Resident | undefined>()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  function handleExport() {
    const rows = residents.map((resident) => [
      resident.firstName,
      resident.middleName,
      resident.lastName,
      resident.suffix,
      resident.gender,
      resident.birthdate.slice(0, 10),
      resident.civilStatus,
      resident.address.purok,
      resident.address.street,
      resident.address.houseNumber,
      resident.contactNumber,
      resident.email,
      resident.religion,
      resident.occupation,
      resident.educationalAttainment,
      resident.emergencyContactName,
      resident.emergencyContactNumber,
      resident.isRegisteredVoter,
      resident.tags.join("|"),
    ])
    downloadCsv("residents.csv", createCsv([...RESIDENT_CSV_HEADERS], rows))
    toast.success(`Exported ${residents.length} resident records.`)
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const rows = parseCsvRecords(await file.text())
      const requiredHeaders = ["firstName", "lastName", "gender", "birthdate", "civilStatus", "sitioPurok", "street", "contactNumber"]
      const missingHeaders = requiredHeaders.filter((header) => !(header in rows[0]))
      if (missingHeaders.length > 0) throw new Error(`Missing CSV columns: ${missingHeaders.join(", ")}. Export a resident CSV to get the required format.`)

      let imported = 0
      const errors: string[] = []
      const seenResidents = new Set(
        residents.map((resident) => `${resident.firstName.toLowerCase()}|${resident.lastName.toLowerCase()}|${resident.birthdate.slice(0, 10)}|${resident.contactNumber}`),
      )
      for (const [index, row] of rows.entries()) {
        const lineNumber = index + 2
        try {
          const firstName = row.firstName.trim()
          const lastName = row.lastName.trim()
          const gender = row.gender.trim().toLowerCase() === "male" ? "Male" : row.gender.trim().toLowerCase() === "female" ? "Female" : undefined
          const civilStatus = CIVIL_STATUSES.find((status) => status.toLowerCase() === row.civilStatus.trim().toLowerCase())
          const location = puroks.find((purok) => purok.name === row.sitioPurok.trim())
          const tags = (row.tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean)
          if (firstName.length < 2 || lastName.length < 2) throw new Error("First and last names must have at least two characters.")
          if (!gender) throw new Error("Gender must be Male or Female.")
          if (!civilStatus) throw new Error("Civil status is invalid.")
          if (!/^\d{4}-\d{2}-\d{2}$/.test(row.birthdate) || Number.isNaN(Date.parse(row.birthdate))) throw new Error("Birthdate must use YYYY-MM-DD format.")
          if (!location) throw new Error(`Sitio/Purok '${row.sitioPurok}' was not found.`)
          if (row.street.trim().length < 2 || !row.contactNumber.trim()) throw new Error("Street and contact number are required.")
          const invalidTag = tags.find((tag) => !RESIDENT_TAGS.includes(tag as ResidentTagType))
          if (invalidTag) throw new Error(`Unknown resident tag '${invalidTag}'.`)

          const duplicateKey = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${row.birthdate}|${row.contactNumber.trim()}`
          if (seenResidents.has(duplicateKey)) throw new Error(`${firstName} ${lastName} already exists or repeats in the file.`)

          const values: ResidentFormValues = {
            firstName,
            middleName: row.middleName || undefined,
            lastName,
            suffix: row.suffix || undefined,
            gender,
            birthdate: row.birthdate,
            civilStatus,
            purok: location.name,
            street: row.street.trim(),
            houseNumber: row.houseNumber ?? "",
            contactNumber: row.contactNumber.trim(),
            email: row.email || undefined,
            religion: row.religion || undefined,
            occupation: row.occupation || undefined,
            educationalAttainment: row.educationalAttainment || undefined,
            emergencyContactName: row.emergencyContactName || undefined,
            emergencyContactNumber: row.emergencyContactNumber || undefined,
            isRegisteredVoter: parseCsvBoolean(row.isRegisteredVoter),
            tags: tags as ResidentTagType[],
          }
          const created = (await residentsApi.create(toResidentPayload(values, puroks))) as { id: string }
          if (values.tags.length > 0) await residentsApi.assignTags(created.id, tagsToPayload(values.tags))
          seenResidents.add(duplicateKey)
          imported += 1
        } catch (error) {
          errors.push(`Row ${lineNumber}: ${error instanceof Error ? error.message : "Import failed."}`)
        }
      }

      queryClient.invalidateQueries({ queryKey: qk.residents.all })
      if (imported > 0) toast.success(`Imported ${imported} resident${imported === 1 ? "" : "s"}.`)
      if (errors.length > 0) toast.error(`${errors.length} row${errors.length === 1 ? "" : "s"} skipped. ${errors.slice(0, 2).join(" ")}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to import resident CSV.")
    } finally {
      event.target.value = ""
    }
  }

  const filtered = React.useMemo(
    () => (purokFilter === "all" ? residents : residents.filter((r) => r.address.purok === purokFilter)),
    [residents, purokFilter]
  )

  const columns = React.useMemo<ColumnDef<Resident>[]>(
    () => [
      {
        accessorFn: (r) => getResidentFullName(r),
        id: "name",
        header: "Resident",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={getResidentFullName(row.original)} photoUrl={row.original.photoUrl} size="sm" />
            <div>
              <p className="font-medium text-foreground">{getResidentFullName(row.original)}</p>
              <p className="text-xs text-muted-foreground">{row.original.gender} · {getResidentAge(row.original.birthdate)} yrs old</p>
            </div>
          </div>
        ),
      },
      {
        id: "address",
        header: "Address",
        accessorFn: (r) => `${r.address.houseNumber} ${r.address.street}`,
        cell: ({ row }) => (
          <div>
            <p className="text-foreground">{row.original.address.purok}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.address.houseNumber} {row.original.address.street}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: "Contact",
        cell: ({ row }) => row.original.contactNumber || "—",
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              row.original.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px]">
                  {tag}
                </Badge>
              ))
            )}
            {row.original.tags.length > 2 ? <Badge variant="outline" className="text-[11px]">+{row.original.tags.length - 2}</Badge> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "View Profile", icon: Eye, onClick: () => router.push(`/dashboard/residents/${row.original.id}`) },
              { label: "Edit", icon: Pencil, onClick: () => { setEditing(row.original); setFormOpen(true) } },
              { label: "Delete", icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeletingId(row.original.id) },
            ]}
          />
        ),
      },
    ],
    [router]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resident Management"
        description="Manage resident records, profiles, and household information."
        actions={
          <div className="flex flex-wrap gap-2">
            <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
            <Button variant="outline" onClick={() => importInputRef.current?.click()} title="Import a residents.csv export">
              <Upload className="size-4" />Import
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" />Export
            </Button>
            <Button onClick={() => router.push("/dashboard/residents/new")}>
              <Plus className="size-4" />Add Resident
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by name, contact number..."
        emptyTitle="No residents found"
        emptyDescription="Try adjusting your filters or add a new resident."
        toolbar={
          <Select value={purokFilter} onValueChange={setPurokFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Sitio / Purok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sitio / Purok</SelectItem>
              {puroks.map((purok) => (
                <SelectItem key={purok.id} value={purok.name}>
                  {purok.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <ResidentFormDialog open={formOpen} onOpenChange={setFormOpen} resident={editing} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Resident Record"
        description="This will permanently remove this resident's record from the system. This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteResident.mutate(deletingId)
        }}
      />
    </div>
  )
}
