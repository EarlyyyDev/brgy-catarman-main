"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RESIDENT_TAGS } from "@/lib/constants"
import { useAssignResidentTags } from "@/lib/api/hooks/use-residents"
import { getResidentFullName } from "@/data/residents"
import type { Resident, ResidentTagType } from "@/types"

export function TagAssignDialog({ open, onOpenChange, resident }: { open: boolean; onOpenChange: (open: boolean) => void; resident?: Resident }) {
  const assignTags = useAssignResidentTags()
  const [tags, setTags] = React.useState<ResidentTagType[]>([])

  React.useEffect(() => {
    if (open && resident) setTags(resident.tags)
  }, [open, resident])

  async function handleSave() {
    if (!resident) return
    await assignTags.mutateAsync({ id: resident.id, tags })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Resident Tags</DialogTitle>
          <DialogDescription>{resident ? getResidentFullName(resident) : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border p-3 sm:grid-cols-2">
          {RESIDENT_TAGS.map((tag) => (
            <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={tags.includes(tag)}
                onCheckedChange={(checked) => setTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)))}
              />
              {tag}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Tags</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
