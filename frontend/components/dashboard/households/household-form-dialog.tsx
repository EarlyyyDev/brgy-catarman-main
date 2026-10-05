"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Pencil, Plus, RefreshCw, UsersRound, X } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ResidentPickerDialog } from "@/components/dashboard/households/resident-picker-dialog"
import { EditMemberDialog } from "@/components/dashboard/households/edit-member-dialog"
import { HOUSEHOLD_CLASSIFICATIONS } from "@/lib/constants"
import { useAddHousehold, useUpdateHousehold } from "@/lib/api/hooks/use-households"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useSitios } from "@/lib/api/hooks/use-geography"
import { ApiError } from "@/lib/api/types"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { cn } from "@/lib/utils"
import type { Household, HouseholdFormValues } from "@/types"

const householdSchema = z.object({
  sitioId: z.string().min(1, "Please select a zone/area."),
  purokId: z.string().min(1, "Please select a purok."),
  street: z.string().min(2, "Please enter a street."),
  houseNumber: z.string(),
  headResidentId: z.string().min(1, "Please select the household head."),
  memberIds: z.array(z.string()),
  contactNumber: z.string().min(7, "Please enter a valid contact number."),
  classification: z.string().min(1),
  is4PsBeneficiary: z.boolean(),
})

type FormValues = z.infer<typeof householdSchema>

interface HouseholdFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  household?: Household
  defaultSitioId?: string
  defaultPurokId?: string
}

const EMPTY_DEFAULTS: FormValues = {
  sitioId: "",
  purokId: "",
  street: "",
  houseNumber: "",
  headResidentId: "",
  memberIds: [],
  contactNumber: "",
  classification: "Not Classified",
  is4PsBeneficiary: false,
}

const FIELD_HEIGHT = "h-11"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
}

function Required() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  )
}

export function HouseholdFormDialog({ open, onOpenChange, household, defaultSitioId, defaultPurokId }: HouseholdFormDialogProps) {
  const addHousehold = useAddHousehold()
  const updateHousehold = useUpdateHousehold()
  const { residents } = useAllResidents()
  const { sitios, puroks } = useSitios()

  // Relationship-to-head is per-household-membership, not an intrinsic
  // resident property, so it's staged here and only persisted (via
  // households-store -> residents-store.linkToHousehold) when the whole
  // household form is submitted -- consistent with every other field here.
  const [relationships, setRelationships] = React.useState<Record<string, string>>({})
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [pickerMode, setPickerMode] = React.useState<"head" | "member">("member")
  const [editingResidentId, setEditingResidentId] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(householdSchema),
    defaultValues: EMPTY_DEFAULTS,
  })

  const headResidentId = form.watch("headResidentId")
  const memberIds = form.watch("memberIds")
  const contactNumber = form.watch("contactNumber")

  const residentMap = React.useMemo(() => new Map(residents.map((r) => [r.id, r])), [residents])
  const headResident = headResidentId ? residentMap.get(headResidentId) : undefined
  const memberRows = React.useMemo(
    () => memberIds.filter((id) => id !== headResidentId).map((id) => residentMap.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [memberIds, headResidentId, residentMap]
  )

  React.useEffect(() => {
    if (open) {
      if (household) {
        const initialRelationships: Record<string, string> = {}
        household.memberIds.forEach((id) => {
          if (id === household.headResidentId) return
          const r = residents.find((res) => res.id === id)
          if (r?.relationshipToHead) initialRelationships[id] = r.relationshipToHead
        })
        setRelationships(initialRelationships)
        form.reset({
          sitioId: household.sitioId,
          purokId: household.purokId,
          street: household.address.street,
          houseNumber: household.address.houseNumber,
          headResidentId: household.headResidentId,
          memberIds: household.memberIds,
          contactNumber: household.contactNumber,
          classification: household.classification,
          is4PsBeneficiary: household.is4PsBeneficiary,
        })
      } else {
        const initialPurok =
          puroks.find((purok) => purok.id === defaultPurokId) ??
          puroks.find((purok) => purok.sitioId === defaultSitioId) ??
          puroks[0]
        setRelationships({})
        form.reset({
          ...EMPTY_DEFAULTS,
          sitioId: initialPurok?.sitioId ?? defaultSitioId ?? sitios[0]?.id ?? "",
          purokId: initialPurok?.id ?? "",
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, household, defaultSitioId, defaultPurokId, form])

  function openHeadPicker() {
    setPickerMode("head")
    setPickerOpen(true)
  }

  function openAddMemberPicker() {
    setPickerMode("member")
    setPickerOpen(true)
  }

  function handlePickerConfirm({ residentId, relationshipToHead }: { residentId: string; relationshipToHead?: string }) {
    if (pickerMode === "head") {
      form.setValue("headResidentId", residentId, { shouldValidate: true })
      // If this resident was already a regular member, promote them out of that bucket.
      if (memberIds.includes(residentId)) {
        form.setValue(
          "memberIds",
          memberIds.filter((id) => id !== residentId)
        )
        setRelationships((prev) => {
          const next = { ...prev }
          delete next[residentId]
          return next
        })
      }
      if (!contactNumber) {
        const resident = residentMap.get(residentId)
        if (resident?.contactNumber) form.setValue("contactNumber", resident.contactNumber)
      }
    } else {
      form.setValue("memberIds", [...memberIds, residentId], { shouldValidate: true })
      if (relationshipToHead) setRelationships((prev) => ({ ...prev, [residentId]: relationshipToHead }))
    }
    setPickerOpen(false)
  }

  function removeMember(residentId: string) {
    form.setValue(
      "memberIds",
      memberIds.filter((id) => id !== residentId)
    )
    setRelationships((prev) => {
      const next = { ...prev }
      delete next[residentId]
      return next
    })
  }

  const editingResident = editingResidentId ? residentMap.get(editingResidentId) : undefined
  const editingIsHead = editingResidentId === headResidentId

  async function onSubmit(values: FormValues) {
    const finalMemberIds = values.memberIds.includes(values.headResidentId) ? values.memberIds : [values.headResidentId, ...values.memberIds]
    const payload: HouseholdFormValues = {
      ...values,
      memberIds: finalMemberIds,
      memberRelationships: relationships,
      classification: values.classification as HouseholdFormValues["classification"],
    }

    try {
      if (household) {
        await updateHousehold.mutateAsync({ id: household.id, values: payload })
      } else {
        await addHousehold.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save household.")
    }
  }

  const hasMembers = Boolean(headResident) || memberRows.length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg p-0 sm:max-w-[720px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-6 sm:px-8">
          <DialogTitle className="text-xl">{household ? "Edit Household" : "Add Household"}</DialogTitle>
          <DialogDescription>
            {household
              ? "Update the household information and list of members."
              : "Fill in the household information and the list of members."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-16rem)] overflow-y-auto px-6 sm:px-8">
          <Form {...form}>
            <form id="household-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              <div className="space-y-3">
                <SectionLabel>Household Location</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="purokId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Sitio / Purok
                          <Required />
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(purokId) => {
                            field.onChange(purokId)
                            const selectedPurok = puroks.find((purok) => purok.id === purokId)
                            form.setValue("sitioId", selectedPurok?.sitioId ?? "", { shouldValidate: true })
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className={cn("w-full", FIELD_HEIGHT)}>
                              <SelectValue placeholder="Select Sitio / Purok" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {puroks.map((purok) => (
                              <SelectItem key={purok.id} value={purok.id}>
                                {purok.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Street
                          <Required />
                        </FormLabel>
                        <FormControl>
                          <Input className={FIELD_HEIGHT} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Number (Optional)</FormLabel>
                        <FormControl>
                          <Input className={FIELD_HEIGHT} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <SectionLabel>Household Information</SectionLabel>

                <div>
                  <p className="mb-2 text-sm font-medium">
                    Household Head
                    <Required />
                  </p>
                  {headResident ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <InitialsAvatar name={getResidentFullName(headResident)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{getResidentFullName(headResident)}</p>
                        <p className="text-xs text-muted-foreground">
                          {getResidentAge(headResident.birthdate)} yrs • {headResident.gender}
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="h-9" onClick={openHeadPicker}>
                        <RefreshCw className="size-3.5" />
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className={cn("w-full justify-start", FIELD_HEIGHT)} onClick={openHeadPicker}>
                      <Plus className="size-4" />
                      Select Household Head
                    </Button>
                  )}
                  {form.formState.errors.headResidentId ? (
                    <p className="mt-1.5 text-sm font-medium text-destructive">{form.formState.errors.headResidentId.message}</p>
                  ) : null}
                </div>

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Number
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <Input className={FIELD_HEIGHT} placeholder="09XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Family Members</SectionLabel>
                  <Button type="button" size="sm" variant="outline" className="h-8" onClick={openAddMemberPicker}>
                    <Plus className="size-3.5" />
                    Add Member
                  </Button>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  {hasMembers ? (
                    <div className="max-h-[320px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-secondary/60">
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Name</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Community Tags</TableHead>
                            <TableHead className="w-20 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {headResident ? (
                            <TableRow>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <InitialsAvatar name={getResidentFullName(headResident)} size="sm" />
                                  <span className="font-medium">{getResidentFullName(headResident)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Household Head</span>
                              </TableCell>
                              <TableCell>{getResidentAge(headResident.birthdate)}</TableCell>
                              <TableCell>{headResident.gender}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {headResident.tags.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  ) : (
                                    headResident.tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                                        {tag}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground"
                                  onClick={() => setEditingResidentId(headResident.id)}
                                  aria-label={`Edit ${getResidentFullName(headResident)}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {memberRows.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <InitialsAvatar name={getResidentFullName(member)} size="sm" />
                                  <span>{getResidentFullName(member)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{relationships[member.id] ?? "—"}</TableCell>
                              <TableCell>{getResidentAge(member.birthdate)}</TableCell>
                              <TableCell>{member.gender}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {member.tags.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  ) : (
                                    member.tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                                        {tag}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-0.5">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground"
                                    onClick={() => setEditingResidentId(member.id)}
                                    aria-label={`Edit ${getResidentFullName(member)}`}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeMember(member.id)}
                                    aria-label={`Remove ${getResidentFullName(member)}`}
                                  >
                                    <X className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                      <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <UsersRound className="size-5" />
                      </span>
                      <p className="text-sm font-medium">No family members have been added.</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        The selected Household Head will automatically become the first household member.
                      </p>
                      <Button type="button" size="sm" className="mt-2" onClick={openAddMemberPicker}>
                        <Plus className="size-3.5" />
                        Add Member
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <SectionLabel>Household Classification</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="classification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="invisible">Classification</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className={cn("w-full", FIELD_HEIGHT)}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {HOUSEHOLD_CLASSIFICATIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is4PsBeneficiary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="invisible">4Ps</FormLabel>
                        <div className={cn("flex items-center gap-2", FIELD_HEIGHT)}>
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer font-normal">4Ps Beneficiary Household</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/30 px-6 py-4 sm:px-8">
          <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="household-form" className="h-11">
            {household ? "Save Changes" : "Save Household"}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <ResidentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode={pickerMode}
        excludeResidentIds={[headResidentId, ...memberIds].filter(Boolean)}
        onConfirm={handlePickerConfirm}
      />

      <EditMemberDialog
        open={!!editingResidentId}
        onOpenChange={(o) => !o && setEditingResidentId(null)}
        resident={editingResident}
        relationship={editingResidentId ? (relationships[editingResidentId] ?? "") : ""}
        showRelationship={!editingIsHead}
        onSave={(relationship) => {
          if (editingResidentId && !editingIsHead) {
            setRelationships((prev) => ({ ...prev, [editingResidentId]: relationship }))
          }
        }}
      />
    </>
  )
}
