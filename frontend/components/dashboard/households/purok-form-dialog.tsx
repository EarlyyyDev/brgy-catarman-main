"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAddPurok, useRenamePurok } from "@/lib/api/hooks/use-geography"
import { ApiError } from "@/lib/api/types"
import type { HouseholdPurok } from "@/types"

const purokSchema = z.object({
  name: z.string().min(1, "Purok name cannot be empty."),
})

type FormValues = z.infer<typeof purokSchema>

interface PurokFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (locationId: string) => void
  /** Required when creating a new purok; ignored when editing. */
  sitioId?: string
  /** Pass an existing purok to edit/rename it instead of creating a new one. */
  purok?: HouseholdPurok
}

export function PurokFormDialog({ open, onOpenChange, onCreated, sitioId, purok }: PurokFormDialogProps) {
  const addPurok = useAddPurok()
  const renamePurok = useRenamePurok()
  const isEditing = Boolean(purok)

  const form = useForm<FormValues>({
    resolver: zodResolver(purokSchema),
    defaultValues: { name: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ name: purok?.name ?? "" })
    }
  }, [open, purok, form])

  async function onSubmit(values: FormValues) {
    try {
      if (purok) {
        const updated = await renamePurok.mutateAsync({ id: purok.id, name: values.name })
        toast.success(`Purok renamed to "${updated.name}".`)
      } else {
        if (!sitioId) return
        const created = await addPurok.mutateAsync({ sitioId, name: values.name })
        toast.success(`Sitio / Purok "${created.name}" created.`)
        onCreated?.(created.id)
      }
      onOpenChange(false)
    } catch (err) {
      form.setError("name", { message: err instanceof ApiError ? err.message : "Unable to save purok." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Sitio / Purok" : "Add Sitio / Purok"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this combined barangay location." : "Create a location used consistently for residents and households."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="purok-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio / Purok Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Sitio / Purok Name" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="purok-form" className="bg-primary hover:bg-primary/90">
            {isEditing ? "Save Changes" : "Create Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
