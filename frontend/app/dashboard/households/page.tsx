"use client"

import * as React from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"
import { Building2, ChevronRight, MapPinned, Plus, UsersRound } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { HouseholdToolbar } from "@/components/dashboard/households/household-toolbar"
import { HouseholdStatCard } from "@/components/dashboard/households/household-stat-card"
import { LocationSidebar, MobileLocationSelect } from "@/components/dashboard/households/location-sidebar"
import { LocationHouseholdList } from "@/components/dashboard/households/location-household-list"
import { HouseholdFormDialog } from "@/components/dashboard/households/household-form-dialog"
import { PurokFormDialog } from "@/components/dashboard/households/purok-form-dialog"
import { useAddHousehold, useAllHouseholds, useDeleteHousehold } from "@/lib/api/hooks/use-households"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useSitios, useDeletePurok } from "@/lib/api/hooks/use-geography"
import { qk } from "@/lib/api/query-keys"
import { householdMatchesSearch } from "@/lib/household-search"
import { getResidentFullName } from "@/data/residents"
import type { HouseholdStatus } from "@/lib/household-status"
import { HOUSEHOLD_CLASSIFICATIONS } from "@/lib/constants"
import { createCsv, downloadCsv, parseCsvRecords, printTable } from "@/lib/csv"
import type { Household, HouseholdClassification, HouseholdFormValues } from "@/types"

const HOUSEHOLD_CSV_HEADERS = [
  "householdNumber",
  "purokId",
  "locationName",
  "sitioId",
  "street",
  "houseNumber",
  "headResidentId",
  "headResidentName",
  "memberIds",
  "memberRelationships",
  "contactNumber",
  "classification",
  "is4PsBeneficiary",
] as const

export default function HouseholdsPage() {
  const queryClient = useQueryClient()
  const { households } = useAllHouseholds()
  const addHousehold = useAddHousehold({ showSuccessMessage: false })
  const deleteHousehold = useDeleteHousehold()
  const deletePurok = useDeletePurok()
  const { residents } = useAllResidents()
  const { sitios, puroks } = useSitios()

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: qk.geography.all })
    queryClient.invalidateQueries({ queryKey: qk.households.all })
    queryClient.invalidateQueries({ queryKey: qk.residents.all })
    toast.success("Household list refreshed.")
  }

  const [selectedLocationId, setSelectedLocationId] = React.useState("")

  React.useEffect(() => {
    if (!selectedLocationId && puroks.length > 0) setSelectedLocationId(puroks[0].id)
  }, [puroks, selectedLocationId])
  const [search, setSearch] = React.useState("")
  const [classificationFilter, setClassificationFilter] = React.useState<HouseholdClassification[]>([])
  const [statusFilter, setStatusFilter] = React.useState<HouseholdStatus[]>([])
  const [expandedHousehold, setExpandedHousehold] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Household | undefined>()
  const [formDefaults, setFormDefaults] = React.useState<{ purokId?: string }>({})
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [locationFormOpen, setLocationFormOpen] = React.useState(false)
  const [editingLocationId, setEditingLocationId] = React.useState<string | null>(null)
  const [deletingLocationId, setDeletingLocationId] = React.useState<string | null>(null)

  const residentMap = React.useMemo(() => new Map(residents.map((r) => [r.id, r])), [residents])

  function householdCsvRow(household: Household) {
    const head = residentMap.get(household.headResidentId)
    const location = puroks.find((purok) => purok.id === household.purokId)
    const memberRelationships = Object.fromEntries(
      household.memberIds
        .filter((id) => id !== household.headResidentId)
        .map((id) => [id, residentMap.get(id)?.relationshipToHead ?? ""]),
    )
    return [
      household.householdNumber,
      household.purokId,
      location?.name ?? "",
      household.sitioId,
      household.address.street,
      household.address.houseNumber,
      household.headResidentId,
      head ? getResidentFullName(head) : "",
      household.memberIds.join("|"),
      JSON.stringify(memberRelationships),
      household.contactNumber,
      household.classification,
      household.is4PsBeneficiary,
    ]
  }

  function handleExportHouseholds() {
    downloadCsv("households.csv", createCsv([...HOUSEHOLD_CSV_HEADERS], households.map(householdCsvRow)))
    toast.success(`Exported ${households.length} household records.`)
  }

  function handlePrintHouseholds() {
    const rows = households.map((household) => {
      const head = residentMap.get(household.headResidentId)
      const location = puroks.find((purok) => purok.id === household.purokId)
      return [
        household.householdNumber,
        location?.name ?? "",
        head ? getResidentFullName(head) : "Unassigned",
        household.memberIds.length,
        household.address.street,
        household.address.houseNumber,
        household.contactNumber,
        household.classification,
      ]
    })
    if (!printTable("Household Management", ["Household No.", "Sitio / Purok", "Head", "Members", "Street", "House No.", "Contact", "Classification"], rows)) {
      toast.error("Allow pop-ups to print the household report.")
    }
  }

  async function handleImportHouseholds(file: File) {
    const rows = parseCsvRecords(await file.text())
    const requiredHeaders = ["purokId", "sitioId", "street", "headResidentId", "contactNumber"]
    const missingHeaders = requiredHeaders.filter((header) => !(header in rows[0]))
    if (missingHeaders.length > 0) throw new Error(`Missing CSV columns: ${missingHeaders.join(", " )}. Export a household CSV to get the required format.`)

    let imported = 0
    const errors: string[] = []
    const seenHeads = new Set(households.map((household) => household.headResidentId))
    for (const [index, row] of rows.entries()) {
      const lineNumber = index + 2
      try {
        const location = puroks.find((purok) => purok.id === row.purokId) ?? puroks.find((purok) => purok.name === row.locationName)
        if (!location || location.sitioId !== row.sitioId) throw new Error("Sitio/Purok reference does not match this database.")
        const head = residentMap.get(row.headResidentId)
        if (!head) throw new Error("Household head ID does not match a registered resident.")
        if (seenHeads.has(head.id)) throw new Error(`${getResidentFullName(head)} already heads a household or repeats in the file.`)

        const memberIds = [...new Set([head.id, ...(row.memberIds ?? "").split("|").map((id) => id.trim()).filter(Boolean)])]
        const missingMember = memberIds.find((id) => !residentMap.has(id))
        if (missingMember) throw new Error(`Member ID ${missingMember} does not match a registered resident.`)

        let memberRelationships: Record<string, string> = {}
        if (row.memberRelationships) {
          const parsed = JSON.parse(row.memberRelationships) as unknown
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            memberRelationships = Object.fromEntries(
              Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
            )
          }
        }

        const classification = HOUSEHOLD_CLASSIFICATIONS.includes(row.classification as HouseholdClassification)
          ? (row.classification as HouseholdClassification)
          : "Not Classified"
        const values: HouseholdFormValues = {
          sitioId: location.sitioId,
          purokId: location.id,
          street: row.street,
          houseNumber: row.houseNumber ?? "",
          headResidentId: head.id,
          memberIds,
          memberRelationships,
          contactNumber: row.contactNumber,
          classification,
          is4PsBeneficiary: ["true", "yes", "1"].includes((row.is4PsBeneficiary ?? "").toLowerCase()),
        }
        await addHousehold.mutateAsync(values)
        seenHeads.add(head.id)
        imported += 1
      } catch (error) {
        errors.push(`Row ${lineNumber}: ${error instanceof Error ? error.message : "Import failed."}`)
      }
    }

    queryClient.invalidateQueries({ queryKey: qk.households.all })
    queryClient.invalidateQueries({ queryKey: qk.residents.all })
    if (imported > 0) toast.success(`Imported ${imported} household${imported === 1 ? "" : "s"}.`)
    if (errors.length > 0) toast.error(`${errors.length} row${errors.length === 1 ? "" : "s"} skipped. ${errors.slice(0, 2).join(" ")}`)
    if (imported === 0 && errors.length === 0) toast("No household records were imported.")
  }

  function handleToggleHousehold(householdId: string) {
    setExpandedHousehold((prev) => (prev === householdId ? null : householdId))
  }

  function handleSelectLocation(locationId: string) {
    setSelectedLocationId(locationId)
    setExpandedHousehold(null)
  }

  // Jump to the matching location so searched household heads are visible.
  React.useEffect(() => {
    const term = search.trim()
    if (!term) return

    const match = households.find((h) => householdMatchesSearch(h, residentMap, term))
    if (!match) return

    setSelectedLocationId((prev) => (prev === match.purokId ? prev : match.purokId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function openAddDialog(locationId?: string) {
    const targetLocationId = locationId ?? selectedLocationId
    setEditing(undefined)
    setFormDefaults({ purokId: targetLocationId })
    setFormOpen(true)
  }

  function openEditDialog(household: Household) {
    setEditing(household)
    setFormDefaults({})
    setFormOpen(true)
  }

  const totalResidents = residents.length
  const selectedLocation = puroks.find((location) => location.id === selectedLocationId)
  const selectedLocationHouseholdCount = households.filter((household) => household.purokId === selectedLocationId).length
  const editingLocation = puroks.find((location) => location.id === editingLocationId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Link href="/dashboard/overview" className="hover:text-primary hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Household Management</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Household Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage households by the Sitio / Purok recorded on the barangay form.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-11 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-150 hover:bg-primary/90 sm:w-auto"
            onClick={() => setLocationFormOpen(true)}
          >
            <Plus className="size-4.5" />
            Add Sitio / Purok
          </Button>
          <Button
            className="h-11 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-150 hover:bg-primary/90 sm:w-auto"
            onClick={() => openAddDialog()}
          >
            <Plus className="size-4.5" />
            New Household
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <HouseholdStatCard label="Households" description="Registered Records" value={households.length} icon={Building2} />
        <HouseholdStatCard label="Families" description="Registered Families" value={households.length} icon={UsersRound} />
        <HouseholdStatCard label="Residents" description="Linked Residents" value={totalResidents} icon={UsersRound} />
        <HouseholdStatCard label="Sitio / Purok" description="Coverage Areas" value={puroks.length} icon={MapPinned} />
      </div>

      <HouseholdToolbar
        search={search}
        onSearchChange={setSearch}
        classificationFilter={classificationFilter}
        onClassificationFilterChange={setClassificationFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={handleRefresh}
        onImportFile={handleImportHouseholds}
        onExport={handleExportHouseholds}
        onPrint={handlePrintHouseholds}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <LocationSidebar
          selectedLocationId={selectedLocationId}
          onSelect={handleSelectLocation}
          onEdit={(locationId) => setEditingLocationId(locationId)}
          onDelete={(locationId) => setDeletingLocationId(locationId)}
        />

        <div className="min-w-0 flex-1 space-y-4">
          <MobileLocationSelect selectedLocationId={selectedLocationId} onSelect={handleSelectLocation} />

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-semibold text-foreground">{selectedLocation?.name ?? "Sitio / Purok"}</h2>
            <span className="text-sm text-muted-foreground">
              {selectedLocationHouseholdCount} Household{selectedLocationHouseholdCount !== 1 ? "s" : ""}
            </span>
          </div>

          <LocationHouseholdList
            locationId={selectedLocationId}
            searchTerm={search}
            classificationFilter={classificationFilter}
            statusFilter={statusFilter}
            expandedHouseholdId={expandedHousehold}
            onToggleHousehold={handleToggleHousehold}
            onEdit={openEditDialog}
            onDelete={setDeletingId}
          />
        </div>
      </div>

      <PurokFormDialog
        open={locationFormOpen || !!editingLocationId}
        onOpenChange={(open) => {
          setLocationFormOpen(open)
          if (!open) setEditingLocationId(null)
        }}
        sitioId={editingLocation?.sitioId ?? selectedLocation?.sitioId ?? sitios[0]?.id}
        purok={editingLocation}
        onCreated={setSelectedLocationId}
      />

      <HouseholdFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        household={editing}
        defaultPurokId={formDefaults.purokId}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Household"
        description="This will permanently remove this household record. Member resident records will not be deleted."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteHousehold.mutate(deletingId)
        }}
      />

      <ConfirmDialog
        open={!!deletingLocationId}
        onOpenChange={(open) => !open && setDeletingLocationId(null)}
        title="Delete Sitio / Purok"
        description="This will remove the location. Locations with residents or households cannot be deleted."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingLocationId) deletePurok.mutate(deletingLocationId, {
            onSuccess: () => {
              if (selectedLocationId === deletingLocationId) setSelectedLocationId("")
            },
          })
        }}
      />
    </div>
  )
}
