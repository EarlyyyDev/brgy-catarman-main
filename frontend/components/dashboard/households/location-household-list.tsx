"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Archive, ArchiveRestore, Eye, FileText, MoreHorizontal, Pencil, Printer, Trash2, UsersRound } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { HighlightMatch } from "@/components/dashboard/households/highlight-match"
import { FamilyMembersTable } from "@/components/dashboard/households/family-members-table"
import { useAllHouseholds, useArchiveHousehold, useRestoreHousehold } from "@/lib/api/hooks/use-households"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useMe } from "@/lib/api/hooks/use-auth"
import { getResidentFullName } from "@/data/residents"
import { householdMatchesSearch } from "@/lib/household-search"
import { getHouseholdStatus, type HouseholdStatus } from "@/lib/household-status"
import { cn } from "@/lib/utils"
import { printTable } from "@/lib/csv"
import type { Household, HouseholdClassification } from "@/types"

interface LocationHouseholdListProps {
  locationId: string
  searchTerm: string
  classificationFilter: HouseholdClassification[]
  statusFilter: HouseholdStatus[]
  expandedHouseholdId: string | null
  onToggleHousehold: (id: string) => void
  onEdit: (household: Household) => void
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<HouseholdStatus, string> = {
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Inactive: "bg-[#F1F5F9] text-[#64748B]",
  Archived: "bg-[#FEE2E2] text-[#DC2626]",
}

export function LocationHouseholdList({
  locationId,
  searchTerm,
  classificationFilter,
  statusFilter,
  expandedHouseholdId,
  onToggleHousehold,
  onEdit,
  onDelete,
}: LocationHouseholdListProps) {
  const { households, isLoading } = useAllHouseholds()
  const archiveHousehold = useArchiveHousehold()
  const restoreHousehold = useRestoreHousehold()
  const { residents } = useAllResidents()
  const { data: session } = useMe()
  const residentMap = React.useMemo(() => new Map(residents.map((resident) => [resident.id, resident])), [residents])
  const canManage = Boolean(session)

  function handlePrintHousehold(household: Household) {
    const location = residentMap.get(household.headResidentId)?.address.purok ?? ""
    const memberRows = household.memberIds.map((residentId) => {
      const resident = residentMap.get(residentId)
      return [
        "Resident",
        resident ? getResidentFullName(resident) : "Unknown resident",
        residentId === household.headResidentId ? "Household Head" : "Member",
        resident?.relationshipToHead ?? "",
        [resident?.gender, resident?.contactNumber].filter(Boolean).join(" · "),
      ]
    })
    const headers = ["Record Type", "Name / Field", "Value", "Relationship / Address", "Additional Details"]
    const householdRows = [
      ["Household", "Household Number", household.householdNumber, "", ""],
      ["Household", "Sitio / Purok", location, "", ""],
      ["Household", "Street", household.address.street, `House Number: ${household.address.houseNumber || "—"}`, `Contact: ${household.contactNumber}`],
      ["Household", "Classification", household.classification, `4Ps: ${household.is4PsBeneficiary ? "Yes" : "No"}`, household.isArchived ? "Archived" : "Active"],
    ]
    const printed = printTable(`Household ${household.householdNumber}`, headers, [...householdRows, ...memberRows])
    if (!printed) toast.error("Allow pop-ups to print the household record.")
  }

  const rows = React.useMemo(() => {
    return households
      .filter((household) => household.purokId === locationId)
      .filter((household) => householdMatchesSearch(household, residentMap, searchTerm))
      .filter((household) => classificationFilter.length === 0 || classificationFilter.includes(household.classification))
      .map((household) => ({
        household,
        headName: residentMap.get(household.headResidentId) ? getResidentFullName(residentMap.get(household.headResidentId)!) : "Unassigned",
        status: getHouseholdStatus(household, residentMap),
      }))
      .filter((row) => statusFilter.length === 0 || statusFilter.includes(row.status))
      .sort((a, b) => a.household.householdNumber.localeCompare(b.household.householdNumber))
  }, [households, locationId, residentMap, searchTerm, classificationFilter, statusFilter])

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-lg" />)}</div>
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        {searchTerm || classificationFilter.length || statusFilter.length ? "No households match these filters in this Sitio/Purok." : "No households in this Sitio/Purok yet."}
      </p>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={expandedHouseholdId ?? ""}
      onValueChange={(value) => onToggleHousehold(value || expandedHouseholdId || "")}
      className="space-y-2"
    >
      {rows.map(({ household, headName, status }) => (
        <AccordionItem key={household.id} value={household.id} className="rounded-lg border border-border bg-card transition-colors hover:bg-muted/30">
          <div className="flex items-center gap-1 px-2">
            <AccordionTrigger className="flex-1 items-center py-2.5 hover:no-underline">
              <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <InitialsAvatar name={headName} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground"><HighlightMatch text={headName} query={searchTerm} /></span>
                  <span className="block text-xs text-muted-foreground"><HighlightMatch text={household.householdNumber} query={searchTerm} /></span>
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground/80 sm:inline-flex">
                  <UsersRound className="size-3.5 text-muted-foreground" />{household.memberIds.length}
                </span>
                <span className="shrink-0"><span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>{status}</span></span>
              </span>
            </AccordionTrigger>
            {canManage ? (
              <div onClick={(event) => event.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Household actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => onToggleHousehold(household.id)}><Eye className="size-4" />View Household</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(household)}><Pencil className="size-4" />Edit Household</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`Open Document Requests to generate a certificate for ${household.householdNumber}.`)}><FileText className="size-4" />Generate Certificate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrintHousehold(household)}><Printer className="size-4" />Print Household Record</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {household.isArchived ? (
                      <DropdownMenuItem onClick={() => restoreHousehold.mutate(household.id)}><ArchiveRestore className="size-4" />Restore</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => archiveHousehold.mutate(household.id)}><Archive className="size-4" />Archive</DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(household.id)}><Trash2 className="size-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>
          <AccordionContent className="border-t border-border px-1"><FamilyMembersTable household={household} /></AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}