"use client"

import * as React from "react"
import { Pencil, Plus, Siren, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  useAddEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
  useUpdateEmergencyContact,
} from "@/lib/api/hooks/use-emergency-contacts"
import type { EmergencyContact } from "@/types"

const CATEGORIES: EmergencyContact["category"][] = ["Police", "Fire", "Medical", "Disaster Response", "Barangay Hotline", "Other"]
type ContactValues = Omit<EmergencyContact, "id">

const EMPTY_CONTACT: ContactValues = {
  name: "",
  category: "Barangay Hotline",
  contactNumber: "",
  address: "",
  availability: "",
}

export function EmergencyContactsSettings() {
  const { emergencyContacts, isLoading } = useEmergencyContacts()
  const addContact = useAddEmergencyContact()
  const updateContact = useUpdateEmergencyContact()
  const deleteContact = useDeleteEmergencyContact()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EmergencyContact | null>(null)
  const [deleting, setDeleting] = React.useState<EmergencyContact | null>(null)
  const [values, setValues] = React.useState<ContactValues>(EMPTY_CONTACT)
  const saving = addContact.isPending || updateContact.isPending

  function openAddDialog() {
    setEditing(null)
    setValues(EMPTY_CONTACT)
    setDialogOpen(true)
  }

  function openEditDialog(contact: EmergencyContact) {
    setEditing(contact)
    setValues({
      name: contact.name,
      category: contact.category,
      contactNumber: contact.contactNumber,
      address: contact.address ?? "",
      availability: contact.availability,
    })
    setDialogOpen(true)
  }

  async function saveContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      ...values,
      name: values.name.trim(),
      contactNumber: values.contactNumber.trim(),
      address: values.address?.trim() || undefined,
      availability: values.availability.trim(),
    }
    if (editing) {
      await updateContact.mutateAsync({ id: editing.id, values: payload })
    } else {
      await addContact.mutateAsync(payload)
    }
    setDialogOpen(false)
  }

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Siren className="size-4 text-destructive" />
              Emergency Hotlines
            </p>
            <p className="mt-1 text-xs text-muted-foreground">These contacts are shown on the public website and in the AI assistant’s information.</p>
          </div>
          <Button type="button" size="sm" onClick={openAddDialog}>
            <Plus className="size-4" />
            Add Hotline
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading emergency hotlines...</p>
        ) : emergencyContacts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No emergency hotlines have been added.</p>
        ) : (
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contact.category} · {contact.contactNumber} · {contact.availability}
                  </p>
                  {contact.address ? <p className="text-xs text-muted-foreground">{contact.address}</p> : null}
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${contact.name}`} onClick={() => openEditDialog(contact)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${contact.name}`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(contact)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) setDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Emergency Hotline" : "Add Emergency Hotline"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveContact} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergency-contact-name">Name</Label>
              <Input
                id="emergency-contact-name"
                required
                maxLength={120}
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Catarman Barangay Hotline"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency-contact-category">Category</Label>
              <select
                id="emergency-contact-category"
                required
                value={values.category}
                onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as EmergencyContact["category"] }))}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
              >
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency-contact-number">Phone Number</Label>
              <Input
                id="emergency-contact-number"
                type="tel"
                required
                maxLength={40}
                value={values.contactNumber}
                onChange={(event) => setValues((current) => ({ ...current, contactNumber: event.target.value }))}
                placeholder="e.g. 0917 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency-contact-availability">Availability</Label>
              <Input
                id="emergency-contact-availability"
                required
                maxLength={120}
                value={values.availability}
                onChange={(event) => setValues((current) => ({ ...current, availability: event.target.value }))}
                placeholder="e.g. 24/7"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency-contact-address">Address (optional)</Label>
              <Input
                id="emergency-contact-address"
                maxLength={255}
                value={values.address ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
                placeholder="Office or station address"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Hotline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Emergency Hotline"
        description={`Remove "${deleting?.name}" from the public hotline list?`}
        confirmLabel="Delete Hotline"
        destructive
        onConfirm={async () => {
          if (!deleting) return
          await deleteContact.mutateAsync(deleting.id)
          setDeleting(null)
        }}
      />
    </Card>
  )
}
