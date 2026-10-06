"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, Copy, ShieldAlert } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { CameraCapture } from "@/components/shared/camera-capture"
import { MultiCameraCapture } from "@/components/shared/multi-camera-capture"
import { RecaptchaCheckbox } from "@/components/shared/recaptcha-checkbox"
import { ResidentPickerField, type ResidentPickerValue } from "@/components/shared/resident-picker-field"
import { INCIDENT_CATEGORIES } from "@/data/complaints"
import { useSubmitComplaint } from "@/lib/api/hooks/use-complaints"
import { ApiError } from "@/lib/api/types"
import type { EvidencePhoto } from "@/types"

const incidentSchema = z
  .object({
    reporterPhone: z.string().min(7, "Please enter a valid phone number."),
    reporterEmail: z.email("Please enter a valid email address."),
    reportedPerson: z.string().optional(),
    category: z.enum(INCIDENT_CATEGORIES),
    otherCategoryLabel: z.string().optional(),
    location: z.string().min(3, "Please enter the incident location."),
    incidentDate: z.string().min(1, "Please select the incident date."),
    incidentTime: z.string().min(1, "Please select the incident time."),
    description: z.string().min(15, "Please provide more details (at least 15 characters)."),
  })
  .superRefine((data, ctx) => {
    if (data.category === "Other" && !data.otherCategoryLabel?.trim()) {
      ctx.addIssue({ code: "custom", path: ["otherCategoryLabel"], message: "Please specify the incident category." })
    }
  })

type IncidentValues = z.infer<typeof incidentSchema>

export function ReportIncidentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const submitComplaint = useSubmitComplaint()
  const [reporterPhoto, setReporterPhoto] = React.useState("")
  const [evidence, setEvidence] = React.useState<EvidencePhoto[]>([])
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)
  const [selectedResident, setSelectedResident] = React.useState<ResidentPickerValue | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<"form" | "success">("form")
  const [referenceNumber, setReferenceNumber] = React.useState("")

  const form = useForm<IncidentValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      reporterPhone: "",
      reporterEmail: "",
      reportedPerson: "",
      category: "Loitering",
      otherCategoryLabel: "",
      location: "",
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: "",
      description: "",
    },
  })

  const category = form.watch("category")

  React.useEffect(() => {
    if (open) {
      setPhase("form")
      form.reset()
      setReporterPhoto("")
      setEvidence([])
      setCaptchaToken(null)
      setSelectedResident(null)
      setFormError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(values: IncidentValues) {
    if (!selectedResident) {
      setFormError("Please select your name from the resident list. Only names on record in our household/resident database can submit a report.")
      return
    }
    if (!reporterPhoto) {
      setFormError("Please capture a live photo to verify your identity as the reporter.")
      return
    }
    if (!captchaToken) {
      setFormError("Please complete the verification checkbox before submitting.")
      return
    }
    setFormError(null)

    try {
      const complaint = await submitComplaint.mutateAsync({
        values: { ...values, reporterName: selectedResident.fullName, residentId: selectedResident.id, captchaToken },
        reporterPhotoDataUrl: reporterPhoto,
        evidencePhotos: evidence,
      })
      setReferenceNumber(complaint.referenceNumber)
      setPhase("success")
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to submit your report. Please try again.")
    }
  }

  function copyReference() {
    navigator.clipboard.writeText(referenceNumber)
    toast.success("Reference number copied to clipboard.")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        {phase === "success" ? (
          <>
            <DialogHeader>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Check className="size-7" />
              </div>
              <DialogTitle className="text-center">Incident Report Submitted</DialogTitle>
              <DialogDescription className="text-center">
                Thank you for helping keep our community safe. Your report has been forwarded to barangay staff for review.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <span className="font-heading text-lg font-bold tracking-wide text-primary">{referenceNumber}</span>
              <Button type="button" variant="outline" size="sm" onClick={copyReference}>
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report an Incident</DialogTitle>
              <DialogDescription>
                Help keep our community safe. Your report is kept confidential and reviewed by authorized barangay staff only.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="font-heading text-base font-bold text-foreground">1. Verify Your Identity</h2>
                      <p className="text-sm text-muted-foreground">A live camera capture is required — file uploads are not accepted for this field.</p>
                    </div>
                    <CameraCapture value={reporterPhoto} onChange={setReporterPhoto} />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="font-heading text-base font-bold text-foreground">2. Evidence (optional)</h2>
                      <p className="text-sm text-muted-foreground">Capture incident photos now or add evidence you already have from your gallery or files.</p>
                    </div>
                    <MultiCameraCapture value={evidence} onChange={setEvidence} />
                  </div>
                </div>

                <div className="space-y-1 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">3. Reporter Information</h2>
                  <p className="text-sm text-muted-foreground">Kept strictly confidential and visible only to authorized staff.</p>
                </div>

                <div className="space-y-2">
                  <FormLabel>Full Name</FormLabel>
                  <ResidentPickerField value={selectedResident} onChange={setSelectedResident} />
                  <p className="text-sm text-muted-foreground">
                    Search and select your name as registered in our household/resident records. Only registered residents can submit a report.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0917 234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reporterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormDescription>A confirmation of your report will be sent to this email.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-1 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">4. Incident Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INCIDENT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
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
                    name="reportedPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reported Person (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Name, if known" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {category === "Other" ? (
                  <FormField
                    control={form.control}
                    name="otherCategoryLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe the type of incident" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Rizal Street, Purok 1 - Poblacion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="incidentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Describe what happened in detail..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col items-start gap-3 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">5. Verification</h2>
                  <RecaptchaCheckbox token={captchaToken} onChange={setCaptchaToken} />
                </div>

                {formError ? <p className="text-sm font-medium text-destructive">{formError}</p> : null}

                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  <ShieldAlert className="size-4" />
                  Submit Report
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
