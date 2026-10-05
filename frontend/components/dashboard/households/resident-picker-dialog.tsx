"use client"

import * as React from "react"
import { Search } from "lucide-react"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { RELATIONSHIP_OPTIONS } from "@/lib/constants"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { cn } from "@/lib/utils"

interface ResidentPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "head" | "member"
  excludeResidentIds: string[]
  onConfirm: (result: { residentId: string; relationshipToHead?: string }) => void
}

export function ResidentPickerDialog({ open, onOpenChange, mode, excludeResidentIds, onConfirm }: ResidentPickerDialogProps) {
  const { residents } = useAllResidents()
  const [search, setSearch] = React.useState("")
  const [selectedResidentId, setSelectedResidentId] = React.useState<string | null>(null)
  const [relationship, setRelationship] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    setSearch("")
    setSelectedResidentId(null)
    setRelationship("")
  }, [open])

  const availableResidents = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return residents
      .filter((resident) => !excludeResidentIds.includes(resident.id))
      .filter((resident) => !term || getResidentFullName(resident).toLowerCase().includes(term))
  }, [residents, excludeResidentIds, search])

  function confirmSelection() {
    if (!selectedResidentId) {
      toast.error("Select a resident first.")
      return
    }
    if (mode === "member" && !relationship) {
      toast.error("Select the relationship to the household head.")
      return
    }
    onConfirm({ residentId: selectedResidentId, relationshipToHead: mode === "member" ? relationship : undefined })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <DialogTitle>{mode === "head" ? "Select Household Head" : "Select Household Member"}</DialogTitle>
          <DialogDescription>Select a resident already registered in Resident Management.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search residents by name..." className="h-11 pl-9" />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {availableResidents.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matching residents. Add the resident in Resident Management first.</p>
            ) : (
              availableResidents.map((resident) => (
                <button
                  type="button"
                  key={resident.id}
                  onClick={() => setSelectedResidentId(resident.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    selectedResidentId === resident.id && "bg-primary/10 hover:bg-primary/10",
                  )}
                >
                  <InitialsAvatar name={getResidentFullName(resident)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{getResidentFullName(resident)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {getResidentAge(resident.birthdate)} yrs · {resident.gender} · {resident.address.purok}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {mode === "member" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship to Household Head</label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-11" onClick={confirmSelection} disabled={!selectedResidentId || (mode === "member" && !relationship)}>
            {mode === "head" ? "Set as Household Head" : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}