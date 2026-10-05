"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSetStaffPassword } from "@/lib/api/hooks/use-staff"
import { ApiError } from "@/lib/api/types"
import type { StaffMember } from "@/types"

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof passwordSchema>

export function StaffPasswordDialog({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff?: StaffMember }) {
  const setStaffPassword = useSetStaffPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  React.useEffect(() => {
    if (open) form.reset({ newPassword: "", confirmPassword: "" })
  }, [open, form])

  async function onSubmit(values: FormValues) {
    if (!staff) return
    try {
      await setStaffPassword.mutateAsync({ id: staff.id, newPassword: values.newPassword })
      toast.success(`Password updated for ${staff.name}.`)
      onOpenChange(false)
    } catch (err) {
      form.setError("newPassword", { message: err instanceof ApiError ? err.message : "Unable to update password." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Set a new password for {staff?.name ?? "this account"}. They will need to use it on their next login.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="staff-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
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
          <Button type="submit" form="staff-password-form">
            Update Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
