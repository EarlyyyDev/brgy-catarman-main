"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Camera, Check, Pencil, ShieldQuestion, X } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { AvatarCropDialog } from "@/components/dashboard/settings/avatar-crop-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useMe, useChangeOwnPassword, useUpdateOwnAvatar, useUpdateOwnProfile, useUpdateSecurityQuestions } from "@/lib/api/hooks/use-auth"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import { ApiError } from "@/lib/api/types"
import { SECURITY_QUESTIONS } from "@/lib/security-questions"
import { qk } from "@/lib/api/query-keys"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

const securityQuestionsSchema = z
  .object({
    question1: z.string().min(1, "Please choose a question."),
    answer1: z.string().min(1, "Please provide an answer."),
    question2: z.string().min(1, "Please choose a question."),
    answer2: z.string().min(1, "Please provide an answer."),
  })
  .refine((data) => data.question1 !== data.question2, {
    message: "Please choose two different questions.",
    path: ["question2"],
  })

type SecurityQuestionsFormValues = z.infer<typeof securityQuestionsSchema>

export function MyAccountSettings() {
  const queryClient = useQueryClient()
  const { data: session } = useMe()
  const updateAvatar = useUpdateOwnAvatar()
  const updateProfile = useUpdateOwnProfile()
  const changeOwnPassword = useChangeOwnPassword()
  const updateSecurityQuestions = useUpdateSecurityQuestions()

  // This page is the only place session data (avatar, security questions)
  // gets edited, so always show the true current state here instead of
  // whatever was cached from an earlier visit or a stale session.
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: qk.auth.me })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = React.useState<string | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)
  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState("")

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const securityForm = useForm<SecurityQuestionsFormValues>({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: { question1: "", answer1: "", question2: "", answer2: "" },
  })

  // Pre-fill which questions are already set (never the answers -- those are
  // hashed and write-only, so re-entering them is required to change either
  // question, same as changing a password).
  React.useEffect(() => {
    if (session?.securityQuestion1 || session?.securityQuestion2) {
      securityForm.reset({
        question1: session.securityQuestion1 ?? "",
        answer1: "",
        question2: session.securityQuestion2 ?? "",
        answer2: "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.securityQuestion1, session?.securityQuestion2])

  if (!session) return null

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const url = await readFileAsDataUrl(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  async function handleCropConfirm(dataUrl: string) {
    try {
      const file = dataUrlToFile(dataUrl, "avatar.jpg")
      await updateAvatar.mutateAsync(file)
      toast.success("Profile photo updated.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update profile photo.")
    }
  }

  function startEditingName() {
    setNameDraft(session!.name)
    setEditingName(true)
  }

  async function saveName() {
    const trimmed = nameDraft.trim()
    if (!trimmed) {
      toast.error("Please enter a name.")
      return
    }
    try {
      await updateProfile.mutateAsync(trimmed)
      setEditingName(false)
      toast.success("Name updated.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update name.")
    }
  }

  async function onSubmitPassword(values: PasswordFormValues) {
    try {
      await changeOwnPassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      toast.success("Password changed successfully.")
      form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      form.setError("currentPassword", { message: err instanceof ApiError ? err.message : "Unable to change password." })
    }
  }

  async function onSubmitSecurityQuestions(values: SecurityQuestionsFormValues) {
    try {
      await updateSecurityQuestions.mutateAsync(values)
      toast.success("Security questions updated.")
      securityForm.reset({ question1: "", answer1: "", question2: "", answer2: "" })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update security questions.")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Account" description="View your account details and manage your name, profile photo, and password." />

      <Card className="border-border/70">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <InitialsAvatar name={session.name} photoUrl={session.avatarUrl} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Camera className="size-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName()
                      if (e.key === "Escape") setEditingName(false)
                    }}
                    autoFocus
                    className="h-9 max-w-64"
                  />
                  <Button type="button" size="icon" className="size-8 shrink-0" onClick={saveName}>
                    <Check className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="size-8 shrink-0" onClick={() => setEditingName(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-heading text-lg font-bold text-foreground">{session.name}</p>
                  <button
                    type="button"
                    onClick={startEditingName}
                    aria-label="Edit name"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
              <Badge variant="outline" className="mt-1">{session.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <Label>Email Address</Label>
              <p className="mt-1.5 text-sm text-foreground">{session.email}</p>
            </div>
            <div>
              <Label>Position</Label>
              <p className="mt-1.5 text-sm text-foreground">{session.position}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm font-semibold text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">Enter your current password to set a new one.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-2">
            <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Security Questions</p>
              <p className="text-xs text-muted-foreground">
                {session.securityQuestionsSet
                  ? "Your questions are shown below. Answers are never displayed for security -- re-enter both answers to save any change, even if you're only updating one question."
                  : "Set these up so you can reset your own password later without needing an administrator."}
              </p>
            </div>
          </div>
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSubmitSecurityQuestions)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={securityForm.control}
                  name="question1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question 1</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a question" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SECURITY_QUESTIONS.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="answer1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={securityForm.control}
                  name="question2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question 2</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a question" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SECURITY_QUESTIONS.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="answer2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">{session.securityQuestionsSet ? "Update Security Questions" : "Save Security Questions"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AvatarCropDialog open={cropOpen} onOpenChange={setCropOpen} imageSrc={cropSrc} onConfirm={handleCropConfirm} />
    </div>
  )
}
