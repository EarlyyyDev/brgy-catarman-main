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
import { useAddSitio, useRenameSitio } from "@/lib/api/hooks/use-geography"
import { ApiError } from "@/lib/api/types"
import type { Sitio } from "@/types"

const sitioSchema = z.object({
  name: z.string().min(1, "Sitio name cannot be empty."),
})

type FormValues = z.infer<typeof sitioSchema>

interface AddSitioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (sitioId: string) => void
  /** Pass an existing sitio to edit/rename it instead of creating a new one. */
  sitio?: Sitio
}

export function AddSitioDialog({ open, onOpenChange, onCreated, sitio }: AddSitioDialogProps) {
  const addSitio = useAddSitio()
  const renameSitio = useRenameSitio()
  const isEditing = Boolean(sitio)

  const form = useForm<FormValues>({
    resolver: zodResolver(sitioSchema),
    defaultValues: { name: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ name: sitio?.name ?? "" })
    }
  }, [open, sitio, form])

  async function onSubmit(values: FormValues) {
    try {
      if (sitio) {
        const updated = await renameSitio.mutateAsync({ id: sitio.id, name: values.name })
        toast.success(`Sitio renamed to "${updated.name}".`)
        onOpenChange(false)
      } else {
        const created = await addSitio.mutateAsync(values.name)
        toast.success(`Sitio "${created.name}" created.`)
        onOpenChange(false)
        onCreated?.(created.id)
      }
    } catch (err) {
      form.setError("name", { message: err instanceof ApiError ? err.message : "Unable to save sitio." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Sitio" : "Add New Sitio"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Rename this Sitio." : "Create a new Sitio to organize households."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="add-sitio-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Sitio Name" autoFocus {...field} />
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
          <Button type="submit" form="add-sitio-form" className="bg-primary hover:bg-primary/90">
            {isEditing ? "Save Changes" : "Create Sitio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
