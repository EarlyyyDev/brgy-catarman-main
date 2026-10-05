"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAddStaff, useUpdateStaff } from "@/lib/api/hooks/use-staff"
import { ApiError } from "@/lib/api/types"
import type { StaffMember } from "@/types"

function buildStaffSchema() {
  return z.object({
    name: z.string().min(2, "Please enter the staff member's full name."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(["Staff", "Administrator"]),
    position: z.string().min(2, "Please enter a position/title."),
    contactNumber: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildStaffSchema>>
type CreatedCredentials = { name: string; email: string; position: string; role: string; temporaryPassword: string }

export function StaffFormDialog({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff?: StaffMember }) {
  const addStaff = useAddStaff()
  const updateStaff = useUpdateStaff()
  const [createdCredentials, setCreatedCredentials] = React.useState<CreatedCredentials | null>(null)
  const [copied, setCopied] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(buildStaffSchema()),
    defaultValues: { name: "", email: "", role: "Staff", position: "", contactNumber: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        staff
          ? { name: staff.name, email: staff.email, role: staff.role, position: staff.position, contactNumber: staff.contactNumber ?? "" }
          : { name: "", email: "", role: "Staff", position: "", contactNumber: "" }
      )
    }
  }, [open, staff, form])

  async function onSubmit(values: FormValues) {
    try {
      if (staff) {
        await updateStaff.mutateAsync({ id: staff.id, values })
      } else {
        const { user, temporaryPassword } = await addStaff.mutateAsync(values)
        setCreatedCredentials({
          name: user.name,
          email: user.email,
          position: user.position,
          role: user.role,
          temporaryPassword,
        })
        setCopied(false)
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save staff account.")
    }
  }

  async function copyCredentials() {
    if (!createdCredentials) return
    const details = [
      `Staff account details for ${createdCredentials.name}`,
      `Username: ${createdCredentials.email}`,
      `Temporary password: ${createdCredentials.temporaryPassword}`,
      `Position: ${createdCredentials.position}`,
      `Role: ${createdCredentials.role}`,
      "Please change the temporary password after your first login.",
    ].join("\n")
    try {
      await navigator.clipboard.writeText(details)
      setCopied(true)
      toast.success("Account details copied. Share them through a secure channel.")
    } catch {
      toast.error("Could not copy account details. Check browser clipboard permissions.")
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff Account" : "Add New Staff Account"}</DialogTitle>
          <DialogDescription>{staff ? "Update staff account details." : "Create a new staff or administrator account."}</DialogDescription>
        </DialogHeader>

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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Records Officer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            {!staff ? (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                A temporary password will be generated automatically and shown once the account is created.
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{staff ? "Save Changes" : "Create Account"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <Dialog
      open={!!createdCredentials}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setCreatedCredentials(null)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Staff Account Created</DialogTitle>
          <DialogDescription>
            Share these temporary sign-in details securely. The new staff member will be asked to change the password after signing in.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="mt-1 break-words text-sm font-semibold text-foreground">{createdCredentials.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Username / Email</p>
              <p className="mt-1 break-all text-sm font-medium text-foreground">{createdCredentials.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Temporary Password</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">{createdCredentials.temporaryPassword}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Position</p>
                <p className="mt-1 break-words text-sm text-foreground">{createdCredentials.position}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Role</p>
                <p className="mt-1 break-words text-sm text-foreground">{createdCredentials.role}</p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setCreatedCredentials(null)}>
            Close
          </Button>
          <Button onClick={copyCredentials}>
            <Copy className="size-4" />
            {copied ? "Copied" : "Copy All Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
