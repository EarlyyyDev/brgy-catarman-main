"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CheckCircle2, KeyRound, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useForgotPasswordQuestions, useResetPassword } from "@/lib/api/hooks/use-auth"
import { ApiError } from "@/lib/api/types"

const emailSchema = z.object({
  email: z.email("Please enter a valid email address."),
})
type EmailValues = z.infer<typeof emailSchema>

const answersSchema = z
  .object({
    answer1: z.string().min(1, "Please answer this question."),
    answer2: z.string().min(1, "Please answer this question."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
type AnswersValues = z.infer<typeof answersSchema>

export function ForgotPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const getQuestions = useForgotPasswordQuestions()
  const resetPassword = useResetPassword()
  const [phase, setPhase] = React.useState<"email" | "answers" | "done">("email")
  const [email, setEmail] = React.useState("")
  const [questions, setQuestions] = React.useState<{ question1: string; question2: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } })
  const answersForm = useForm<AnswersValues>({
    resolver: zodResolver(answersSchema),
    defaultValues: { answer1: "", answer2: "", newPassword: "", confirmPassword: "" },
  })

  React.useEffect(() => {
    if (open) {
      setPhase("email")
      setEmail("")
      setQuestions(null)
      setError(null)
      emailForm.reset()
      answersForm.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmitEmail(values: EmailValues) {
    setError(null)
    try {
      const result = await getQuestions.mutateAsync(values.email)
      setEmail(values.email)
      setQuestions(result)
      setPhase("answers")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    }
  }

  async function onSubmitAnswers(values: AnswersValues) {
    setError(null)
    try {
      await resetPassword.mutateAsync({
        email,
        answer1: values.answer1,
        answer2: values.answer2,
        newPassword: values.newPassword,
      })
      setPhase("done")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {phase === "done" ? (
          <>
            <DialogHeader>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="size-7" />
              </div>
              <DialogTitle className="text-center">Password Reset</DialogTitle>
              <DialogDescription className="text-center">
                Your password has been changed successfully. You may now log in with your new password.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : phase === "answers" && questions ? (
          <>
            <DialogHeader>
              <DialogTitle>Answer Your Security Questions</DialogTitle>
              <DialogDescription>Answer both questions correctly, then choose a new password.</DialogDescription>
            </DialogHeader>
            <Form {...answersForm}>
              <form onSubmit={answersForm.handleSubmit(onSubmitAnswers)} className="space-y-5">
                <FormField
                  control={answersForm.control}
                  name="answer1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{questions.question1}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={answersForm.control}
                  name="answer2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{questions.question2}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={answersForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={answersForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
                <Button type="submit" disabled={answersForm.formState.isSubmitting} className="w-full">
                  <KeyRound className="size-4" />
                  Reset Password
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogDescription>
                Enter your account email. If security questions are set up for it, we&apos;ll ask you to answer them to reset your password yourself — no administrator needed.
              </DialogDescription>
            </DialogHeader>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@barangaycatarman.gov.ph" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
                <Button type="submit" disabled={emailForm.formState.isSubmitting} className="w-full">
                  <Search className="size-4" />
                  Continue
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
