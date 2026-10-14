"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, FileCheck2, UserSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PageHeader } from "@/components/shared/page-header"
import { CameraCapture } from "@/components/shared/camera-capture"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { useSubmitWalkInCertificateRequest } from "@/lib/api/hooks/use-certificate-requests"
import { useDocumentTypes } from "@/lib/api/hooks/use-document-types"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { ApiError } from "@/lib/api/types"
import { DOCUMENT_TYPES } from "@/data/certificates"
import { getResidentFullName } from "@/data/residents"
import type { UploadedFile } from "@/types"

const walkInSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES),
    otherDocumentLabel: z.string().optional(),
    requestorName: z.string().min(2, "Please enter the requestor's full name."),
    address: z.string().min(5, "Please enter a complete address."),
    contactNumber: z.string().min(7, "Please enter a valid contact number."),
    email: z.email("Please enter a valid email address."),
    purpose: z.string().min(3, "Please enter the purpose of the request."),
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "Other Barangay Document" && !data.otherDocumentLabel?.trim()) {
      ctx.addIssue({ code: "custom", path: ["otherDocumentLabel"], message: "Please specify the document." })
    }
  })

type WalkInValues = z.infer<typeof walkInSchema>

export default function WalkInCertificatePage() {
  const router = useRouter()
  const { residents } = useAllResidents()
  const { documentTypes } = useDocumentTypes()
  const submitWalkInRequest = useSubmitWalkInCertificateRequest()

  const [selectedResidentId, setSelectedResidentId] = React.useState<string>("")
  const [residentSearch, setResidentSearch] = React.useState("")
  const [residentPhoto, setResidentPhoto] = React.useState("")
  const [requirements, setRequirements] = React.useState<UploadedFile[]>([])
  const [viaRepresentative, setViaRepresentative] = React.useState(false)
  const [authLetter, setAuthLetter] = React.useState<UploadedFile[]>([])
  const [residentId, setResidentId] = React.useState<UploadedFile[]>([])
  const [representativeId, setRepresentativeId] = React.useState<UploadedFile[]>([])
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<WalkInValues>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      documentType: "Barangay Certificate",
      otherDocumentLabel: "",
      requestorName: "",
      address: "",
      contactNumber: "",
      email: "",
      purpose: "",
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const documentType = form.watch("documentType")
  const residentMatches = React.useMemo(() => {
    const query = residentSearch.trim().toLowerCase()
    if (!query) return []
    return residents
      .filter((resident) => `${getResidentFullName(resident)} ${resident.address.purok} ${resident.address.street}`.toLowerCase().includes(query))
      .slice(0, 8)
  }, [residentSearch, residents])

  function handleSelectResident(id: string) {
    setSelectedResidentId(id)
    const resident = residents.find((r) => r.id === id)
    if (resident) {
      const fullName = getResidentFullName(resident)
      setResidentSearch(fullName)
      form.setValue("requestorName", fullName)
      form.setValue("address", `${resident.address.houseNumber} ${resident.address.street}, ${resident.address.purok}, Barangay Catarman`)
      form.setValue("contactNumber", resident.contactNumber)
      form.setValue("email", resident.email ?? "")
    }
  }

  async function onSubmit(values: WalkInValues) {
    if (!residentPhoto) {
      setFormError("Please capture the resident's photo before proceeding.")
      return
    }
    setFormError(null)

    try {
      const request = await submitWalkInRequest.mutateAsync({
        values: { ...values, residentId: selectedResidentId || undefined },
        requirements,
        residentPhotoDataUrl: residentPhoto,
        authorizationLetter: viaRepresentative ? authLetter[0] : undefined,
        representativeId: viaRepresentative ? representativeId[0] : undefined,
        documentTypes,
      })
      router.push(`/dashboard/certificate-templates?requestId=${request.id}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to submit walk-in request.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
      <PageHeader title="Encode Walk-in Request" description="Register an over-the-counter certificate request and generate the document immediately." />

      <Card className="border-border/70">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <UserSearch className="size-5 shrink-0 text-primary" />
              <div className="flex-1">
                <Label className="text-sm font-semibold">Link to Existing Resident (optional)</Label>
                <p className="text-xs text-muted-foreground">Search for a resident to auto-fill their information below.</p>
              </div>
            </div>
            <div className="relative mt-3">
              <Input
                value={residentSearch}
                onChange={(event) => {
                  setResidentSearch(event.target.value)
                  if (!event.target.value.trim()) {
                    setSelectedResidentId("")
                  }
                }}
                placeholder="Search resident by name, purok, or street..."
                className="w-full"
              />
              {residentSearch.trim() && residentMatches.length > 0 ? (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
                  {residentMatches.map((resident) => (
                    <li key={resident.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectResident(resident.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <span className="font-medium text-foreground">{getResidentFullName(resident)}</span>
                        <span className="text-xs text-muted-foreground">{resident.address.purok}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
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
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Employment requirement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {documentType === "Other Barangay Document" ? (
                <FormField
                  control={form.control}
                  name="otherDocumentLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Document</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="requestorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requestor Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address</FormLabel>
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

              <div className="space-y-2 border-t border-border pt-6">
                <h2 className="font-heading text-lg font-bold text-foreground">Capture Resident Photo</h2>
                <CameraCapture
                  value={residentPhoto}
                  onChange={setResidentPhoto}
                  helperText="Capture a clear photo of the requestor for identity verification and to attach to the printed certificate."
                />
              </div>

              <div className="space-y-2 border-t border-border pt-6">
                <h2 className="font-heading text-lg font-bold text-foreground">Requirements (optional)</h2>
                <FileDropzone label="Upload requirements (Valid ID, etc.) — optional for walk-in" value={requirements} onChange={setRequirements} />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <Label className="text-sm font-semibold">Requesting through a Representative</Label>
                  <p className="text-xs text-muted-foreground">Enable if someone is claiming on behalf of the resident.</p>
                </div>
                <Switch checked={viaRepresentative} onCheckedChange={setViaRepresentative} />
              </div>

              {viaRepresentative ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <FileDropzone label="Authorization Letter" multiple={false} value={authLetter} onChange={setAuthLetter} />
                  <FileDropzone label="Resident's Valid ID" multiple={false} value={residentId} onChange={setResidentId} />
                  <FileDropzone label="Representative's Valid ID" multiple={false} value={representativeId} onChange={setRepresentativeId} />
                </div>
              ) : null}

              {formError ? <p className="text-sm font-medium text-destructive">{formError}</p> : null}

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <FileCheck2 className="size-4" />
                Generate Certificate & Print
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
