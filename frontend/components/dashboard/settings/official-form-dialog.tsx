"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Camera } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { AvatarCropDialog } from "@/components/dashboard/settings/avatar-crop-dialog"
import { useAddOfficial, useUpdateOfficial, useOfficials } from "@/lib/api/hooks/use-officials"
import { ApiError } from "@/lib/api/types"
import type { Official } from "@/types"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const officialSchema = z.object({
  name: z.string().min(2, "Please enter the official's name."),
  position: z.string().min(2, "Please enter a position."),
  committee: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().optional(),
  termStart: z.string().min(1),
  termEnd: z.string().min(1),
})

type FormValues = z.infer<typeof officialSchema>

export function OfficialFormDialog({ open, onOpenChange, official }: { open: boolean; onOpenChange: (open: boolean) => void; official?: Official }) {
  const addOfficial = useAddOfficial()
  const updateOfficial = useUpdateOfficial()
  const { officials } = useOfficials()

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = React.useState("")
  const [cropSrc, setCropSrc] = React.useState<string | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: { name: "", position: "", committee: "", contactNumber: "", email: "", termStart: "2023-11-01", termEnd: "2026-10-31" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        official
          ? { name: official.name, position: official.position, committee: official.committee ?? "", contactNumber: official.contactNumber ?? "", email: official.email ?? "", termStart: official.termStart, termEnd: official.termEnd }
          : { name: "", position: "", committee: "", contactNumber: "", email: "", termStart: "2023-11-01", termEnd: "2026-10-31" }
      )
      setPhotoUrl(official?.photoUrl ?? "")
    }
  }, [open, official, form])

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const url = await readFileAsDataUrl(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  async function onSubmit(values: FormValues) {
    try {
      if (official) {
        await updateOfficial.mutateAsync({ id: official.id, values: { ...values, photoUrl } })
      } else {
        await addOfficial.mutateAsync({ ...values, photoUrl, order: officials.length + 1 })
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save official.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{official ? "Edit Official" : "Add Official"}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <div className="relative">
            <InitialsAvatar name={form.watch("name") || "?"} photoUrl={photoUrl} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Camera className="size-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="committee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Committee (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactNumber"
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{official ? "Save Changes" : "Add Official"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AvatarCropDialog open={cropOpen} onOpenChange={setCropOpen} imageSrc={cropSrc} onConfirm={setPhotoUrl} title="Edit Official's Photo" />
    </Dialog>
  )
}
