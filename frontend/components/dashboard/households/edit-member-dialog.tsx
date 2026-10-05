"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RELATIONSHIP_OPTIONS, RESIDENT_TAGS } from "@/lib/constants"
import { useAssignResidentTags } from "@/lib/api/hooks/use-residents"
import { getResidentFullName } from "@/data/residents"
import type { Resident, ResidentTagType } from "@/types"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resident?: Resident
  relationship: string
  showRelationship?: boolean
  onSave: (relationship: string) => void
}

export function EditMemberDialog({ open, onOpenChange, resident, relationship, showRelationship = true, onSave }: EditMemberDialogProps) {
  const assignTags = useAssignResidentTags()
  const [localRelationship, setLocalRelationship] = React.useState(relationship)
  const [localTags, setLocalTags] = React.useState<ResidentTagType[]>(resident?.tags ?? [])

  React.useEffect(() => {
    if (open) {
      setLocalRelationship(relationship)
      setLocalTags(resident?.tags ?? [])
    }
  }, [open, relationship, resident])

  function toggleTag(tag: ResidentTagType, checked: boolean) {
    setLocalTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)))
  }

  async function handleSave() {
    if (!resident) return
    await assignTags.mutateAsync({ id: resident.id, tags: localTags })
    onSave(localRelationship)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg p-0 sm:max-w-[520px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>{resident ? getResidentFullName(resident) : ""}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(85vh-13rem)] overflow-y-auto px-6">
        <div className="space-y-5 py-5">
          {showRelationship ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship to Household Head</label>
              <Select value={localRelationship} onValueChange={setLocalRelationship}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Community Tags</p>
            <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border p-3 sm:grid-cols-2">
              {RESIDENT_TAGS.filter((t) => t !== "4Ps Beneficiary").map((tag) => (
                <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={localTags.includes(tag)} onCheckedChange={(checked) => toggleTag(tag, Boolean(checked))} />
                  {tag}
                </label>
              ))}
            </div>
          </div>
        </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-11" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
