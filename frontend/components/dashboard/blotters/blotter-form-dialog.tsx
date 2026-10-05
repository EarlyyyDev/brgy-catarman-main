"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAddBlotter, useUpdateBlotter } from "@/lib/api/hooks/use-blotters"
import { useStaff } from "@/lib/api/hooks/use-staff"
import { ApiError } from "@/lib/api/types"
import type { Blotter } from "@/types"

const blotterSchema = z.object({
  incidentType: z.string().min(3, "Please enter the incident type."),
  complainantName: z.string().min(2, "Please enter the complainant's name."),
  complainantAddress: z.string().min(3, "Please enter the complainant's address."),
  complainantContact: z.string().min(7, "Please enter a valid contact number."),
  respondentName: z.string().min(2, "Please enter the respondent's name."),
  respondentAddress: z.string().min(3, "Please enter the respondent's address."),
  incidentDate: z.string().min(1, "Please select the incident date."),
  location: z.string().min(3, "Please enter the incident location."),
  narrative: z.string().min(10, "Please provide a case narrative."),
  mediator: z.string().optional(),
})

type FormValues = z.infer<typeof blotterSchema>

export function BlotterFormDialog({ open, onOpenChange, blotter }: { open: boolean; onOpenChange: (open: boolean) => void; blotter?: Blotter }) {
  const addBlotter = useAddBlotter()
  const updateBlotter = useUpdateBlotter()
  const { staffMembers } = useStaff()

  const form = useForm<FormValues>({
    resolver: zodResolver(blotterSchema),
    defaultValues: {
      incidentType: "",
      complainantName: "",
      complainantAddress: "",
      complainantContact: "",
      respondentName: "",
      respondentAddress: "",
      incidentDate: "",
      location: "",
      narrative: "",
      mediator: "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        blotter
          ? {
              incidentType: blotter.incidentType,
              complainantName: blotter.complainantName,
              complainantAddress: blotter.complainantAddress,
              complainantContact: blotter.complainantContact,
              respondentName: blotter.respondentName,
              respondentAddress: blotter.respondentAddress,
              incidentDate: blotter.incidentDate,
              location: blotter.location,
              narrative: blotter.narrative,
              mediator: blotter.mediator ?? "",
            }
          : {
              incidentType: "",
              complainantName: "",
              complainantAddress: "",
              complainantContact: "",
              respondentName: "",
              respondentAddress: "",
              incidentDate: "",
              location: "",
              narrative: "",
              mediator: "",
            }
      )
    }
  }, [open, blotter, form])

  async function onSubmit(values: FormValues) {
    try {
      if (blotter) {
        await updateBlotter.mutateAsync({ id: blotter.id, values, staff: staffMembers })
      } else {
        await addBlotter.mutateAsync({ values, staff: staffMembers })
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save blotter case.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{blotter ? "Edit Blotter Case" : "File New Blotter Case"}</DialogTitle>
          <DialogDescription>Record the details of the incident and involved parties.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <Form {...form}>
            <form id="blotter-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="incidentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Property Dispute" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complainant</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="complainantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complainantContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="complainantAddress"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondent</p>
                <FormField
                  control={form.control}
                  name="respondentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="respondentAddress"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="narrative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Narrative</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mediator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Mediator</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="blotter-form">
            {blotter ? "Save Changes" : "File Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
