"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { ArrowLeft, Download, Eye, Plus, Printer, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { CertificateDocumentEditor } from "@/components/dashboard/certificate-templates/certificate-document-editor"
import { CertificatePreviewPaper } from "@/components/dashboard/certificate-templates/certificate-preview-paper"
import { TemplateSettingsBar } from "@/components/dashboard/certificate-templates/template-settings-bar"
import { CertificatePreviewDialog } from "@/components/dashboard/certificate-templates/mobile-preview-sheet"
import { ScaledDocumentPreview } from "@/components/shared/scaled-document-preview"
import { useCertificateTemplates, useAddCertificateTemplate, useUpdateCertificateTemplate } from "@/lib/api/hooks/use-certificate-templates"
import { useAllCertificateRequests } from "@/lib/api/hooks/use-certificate-requests"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { usePublicSettings, useUpdateSettings, useUploadSettingsImage } from "@/lib/api/hooks/use-settings"
import { usePublicOfficials } from "@/lib/api/hooks/use-officials"
import { getDefaultTemplateBodyHtml } from "@/data/certificate-template-defaults"
import { buildRequestData } from "@/lib/certificate-placeholders"
import { mapDocumentTypeToTemplateType } from "@/lib/certificate-templates"
import { exportElementAsPdf } from "@/lib/export-pdf"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import type { CertificateTemplate, CertificateTemplateStatus, CertificateTemplateType, UploadedFile } from "@/types"

function blankDraft(type: CertificateTemplateType = "Certificate of Residency") {
  return {
    name: `${type} Template`,
    type,
    status: "Active" as CertificateTemplateStatus,
    requireResidentPhoto: true,
    showBarangayLogo: true,
    showMunicipalLogo: true,
    showBarangayDrySeal: true,
    logoSize: 64,
    bodyHtml: getDefaultTemplateBodyHtml(type),
  }
}

function CertificateTemplatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId")
  const { templates, documentTypes, isLoading: templatesLoading } = useCertificateTemplates()
  const addTemplate = useAddCertificateTemplate()
  const updateTemplate = useUpdateCertificateTemplate()
  const { certificateRequests } = useAllCertificateRequests()
  const { residents } = useAllResidents()
  const { settings } = usePublicSettings()
  const updateSettingsMutation = useUpdateSettings()
  const uploadSettingsImage = useUploadSettingsImage()
  const { officials } = usePublicOfficials()

  const activeRequest = requestId ? certificateRequests.find((r) => r.id === requestId) : undefined
  const activeResident = activeRequest?.residentId ? residents.find((r) => r.id === activeRequest.residentId) : undefined
  const requestData = activeRequest ? buildRequestData(activeRequest, officials, settings, activeResident) : undefined
  const requestResidentPhotoUrl = activeRequest ? activeRequest.residentPhotoUrl ?? activeResident?.photoUrl : undefined

  const [barangayLogoFiles, setBarangayLogoFiles] = React.useState<UploadedFile[]>(
    settings.documentLogoUrl
      ? [{ id: "existing-barangay-logo", name: "barangay-logo", url: settings.documentLogoUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }]
      : []
  )
  const [municipalLogoFiles, setMunicipalLogoFiles] = React.useState<UploadedFile[]>(
    settings.municipalLogoUrl
      ? [{ id: "existing-municipal-logo", name: "municipal-logo", url: settings.municipalLogoUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }]
      : []
  )

  /** FileDropzone only ever produces local base64 data: URLs -- these must be
   * uploaded to get a real, persistable URL before saving (matches the same
   * fix already applied on the main System Settings page). */
  async function resolveLogoUrl(files: UploadedFile[], fallback: string): Promise<string> {
    const file = files[0]
    if (!file) return fallback
    if (!file.url.startsWith("data:")) return file.url
    const { url } = await uploadSettingsImage.mutateAsync(dataUrlToFile(file.url, file.name))
    return url
  }

  async function saveCertificateLogos() {
    const [documentLogoUrl, municipalLogoUrl] = await Promise.all([
      resolveLogoUrl(barangayLogoFiles, settings.documentLogoUrl ?? ""),
      resolveLogoUrl(municipalLogoFiles, settings.municipalLogoUrl ?? ""),
    ])
    updateSettingsMutation.mutate(
      { documentLogoUrl, municipalLogoUrl },
      { onSuccess: () => toast.success("Logos updated.") },
    )
  }

  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState(() => blankDraft())
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const printPaperRef = React.useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = React.useState(false)

  // `templates` loads asynchronously, so it's still [] on first render --
  // selectedTemplateId/draft can't be initialized from it directly (that
  // silently locked the editor onto a disconnected blank draft: "Save
  // Template" then created a brand-new duplicate instead of updating the
  // real one, so no edit -- including a logo size change -- ever appeared
  // to save). Do the initial selection once real data actually arrives, but
  // never again after that, so it can't clobber an in-progress edit or a
  // deliberate "New Template" click later.
  const hasInitializedRef = React.useRef(false)
  React.useEffect(() => {
    if (hasInitializedRef.current || templatesLoading || activeRequest) return
    hasInitializedRef.current = true
    if (templates[0]) {
      setSelectedTemplateId(templates[0].id)
      setDraft({ ...templates[0] })
    }
  }, [templatesLoading, templates, activeRequest])

  // When arriving with ?requestId=..., auto-select the template matching what
  // was actually requested, so staff land straight on the right document
  // instead of having to pick it manually from the dropdown.
  React.useEffect(() => {
    if (!activeRequest) return
    hasInitializedRef.current = true
    const targetType = mapDocumentTypeToTemplateType(activeRequest.documentType)
    const match =
      templates.find((t) => t.type === targetType && t.status === "Active") ??
      templates.find((t) => t.type === "Others" && t.status === "Active")
    if (match) {
      setSelectedTemplateId(match.id)
      setDraft({ ...match })
    } else {
      toast.error(`No active certificate template found for "${activeRequest.documentType}".`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRequest?.id])

  function loadTemplate(template: CertificateTemplate) {
    setSelectedTemplateId(template.id)
    setDraft({ ...template })
  }

  function handleSelectTemplate(id: string) {
    const template = templates.find((t) => t.id === id)
    if (template) loadTemplate(template)
  }

  function handleNewTemplate() {
    setSelectedTemplateId(null)
    setDraft(blankDraft())
    toast.success("Started a new blank template.")
  }

  function handleCancel() {
    if (selectedTemplateId) {
      const original = templates.find((t) => t.id === selectedTemplateId)
      if (original) setDraft({ ...original })
    } else {
      setDraft(blankDraft(draft.type))
    }
    toast.success("Changes discarded.")
  }

  function handleReset() {
    setDraft((prev) => ({ ...prev, bodyHtml: getDefaultTemplateBodyHtml(prev.type) }))
    setResetConfirmOpen(false)
    toast.success("Document reset to the default layout.")
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      toast.error("Please enter a template name.")
      return
    }
    const values = {
      name: draft.name,
      type: draft.type,
      status: draft.status,
      requireResidentPhoto: draft.requireResidentPhoto,
      showBarangayLogo: draft.showBarangayLogo,
      showMunicipalLogo: draft.showMunicipalLogo,
      showBarangayDrySeal: draft.showBarangayDrySeal,
      logoSize: draft.logoSize,
      bodyHtml: draft.bodyHtml,
    }

    if (selectedTemplateId) {
      await updateTemplate.mutateAsync({ id: selectedTemplateId, values, documentTypes })
    } else {
      const created = await addTemplate.mutateAsync({ values, documentTypes })
      setSelectedTemplateId(created.id)
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleExportPdf() {
    if (!printPaperRef.current) return
    setExporting(true)
    try {
      await exportElementAsPdf(printPaperRef.current, `${draft.name || "certificate-template"}.pdf`)
      toast.success("PDF exported successfully.")
    } catch {
      toast.error("Unable to export PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-[#F8FAFC]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/dashboard/certificates")} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Certificate Template Builder</h1>
                <p className="text-sm text-muted-foreground">Create and manage reusable barangay certificate templates.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedTemplateId ?? ""} onValueChange={handleSelectTemplate}>
                <SelectTrigger className="h-10 w-56">
                  <SelectValue placeholder="Load a saved template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" className="h-10" onClick={handleNewTemplate}>
                <Plus className="size-4" />
                New Template
              </Button>
              <Button type="button" className="h-10" onClick={handleSave}>
                <Save className="size-4" />
                Save Template
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={handlePrint}>
                <Printer className="size-4" />
                Print Preview
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={handleExportPdf} disabled={exporting}>
                <Download className="size-4" />
                {exporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>

        {activeRequest ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm text-foreground">
              Printing certificate for <span className="font-semibold">{activeRequest.requestorName}</span> · Ref.{" "}
              <span className="font-mono">{activeRequest.referenceNumber}</span> · {activeRequest.documentType}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/certificate-templates")}>
              <X className="size-3.5" />
              Exit request mode
            </Button>
          </div>
        ) : null}

        <TemplateSettingsBar
          name={draft.name}
          onNameChange={(name) => setDraft((prev) => ({ ...prev, name }))}
          type={draft.type}
          onTypeChange={(type) => setDraft((prev) => ({ ...prev, type }))}
          status={draft.status}
          onStatusChange={(status) => setDraft((prev) => ({ ...prev, status }))}
          requireResidentPhoto={draft.requireResidentPhoto}
          onRequireResidentPhotoChange={(requireResidentPhoto) => setDraft((prev) => ({ ...prev, requireResidentPhoto }))}
          showBarangayLogo={draft.showBarangayLogo}
          onShowBarangayLogoChange={(showBarangayLogo) => setDraft((prev) => ({ ...prev, showBarangayLogo }))}
          showMunicipalLogo={draft.showMunicipalLogo}
          onShowMunicipalLogoChange={(showMunicipalLogo) => setDraft((prev) => ({ ...prev, showMunicipalLogo }))}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          onShowBarangayDrySealChange={(showBarangayDrySeal) => setDraft((prev) => ({ ...prev, showBarangayDrySeal }))}
          logoSize={draft.logoSize}
          onLogoSizeChange={(logoSize) => setDraft((prev) => ({ ...prev, logoSize }))}
        />

        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Barangay & Municipal Logos</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Upload the actual seal photos used for the logo placeholders above. These are used on printed certificates only and are shared with the Blotter Template Builder — they do not change the site&apos;s main logo in System Settings. To resize the logos, use the Logo Size slider above; click <strong>Save Template</strong> below to save it.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileDropzone label="Upload Municipal Logo" accept="image/*" multiple={false} value={municipalLogoFiles} onChange={setMunicipalLogoFiles} />
            <FileDropzone label="Upload Barangay Logo" accept="image/*" multiple={false} value={barangayLogoFiles} onChange={setBarangayLogoFiles} />
          </div>

          <Button type="button" className="mt-3" onClick={saveCertificateLogos}>
            Save Logos
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CertificateDocumentEditor html={draft.bodyHtml} onChange={(bodyHtml) => setDraft((prev) => ({ ...prev, bodyHtml }))} />
          </div>

          <div className="hidden min-w-0 lg:col-span-2 lg:block">
            <div className="sticky top-40 space-y-3">
              <p className="font-heading text-sm font-semibold text-foreground">Live Certificate Preview</p>
              <div className="min-w-0 rounded-xl border border-border bg-secondary/30 p-4">
                <ScaledDocumentPreview>
                  <CertificatePreviewPaper
                    bodyHtml={draft.bodyHtml}
                    type={draft.type}
                    requireResidentPhoto={draft.requireResidentPhoto}
                    showBarangayLogo={draft.showBarangayLogo}
                    showMunicipalLogo={draft.showMunicipalLogo}
                    showBarangayDrySeal={draft.showBarangayDrySeal}
                    logoSize={draft.logoSize}
                    data={requestData}
                    residentPhotoUrl={requestResidentPhotoUrl}
                    className="shadow-lg"
                  />
                </ScaledDocumentPreview>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-white p-4 shadow-sm">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => setResetConfirmOpen(true)}>
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={handleExportPdf} disabled={exporting}>
            <Download className="size-4" />
            Export PDF
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button type="button" onClick={handleSave}>
            <Save className="size-4" />
            Save Template
          </Button>
        </div>

        <Button
          type="button"
          size="lg"
          className="fixed bottom-5 right-5 z-30 h-12 rounded-full px-5 shadow-lg lg:hidden"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="size-4" />
          Preview
        </Button>
      </div>

      {/* Print-only copy: sized to fill the printed page while everything above is hidden via print:hidden. */}
      <div className="hidden print:block">
        <CertificatePreviewPaper
          bodyHtml={draft.bodyHtml}
          type={draft.type}
          requireResidentPhoto={draft.requireResidentPhoto}
          showBarangayLogo={draft.showBarangayLogo}
          showMunicipalLogo={draft.showMunicipalLogo}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          logoSize={draft.logoSize}
          data={requestData}
          residentPhotoUrl={requestResidentPhotoUrl}
        />
      </div>

      {/* Export-only copy, kept off-screen at natural size: the visible Live Preview
          above can be scaled down to fit small screens, but html2canvas captures
          whatever size an element is actually rendered at, so PDF export must read
          from a copy that's never visually scaled. */}
      <div className="pointer-events-none fixed top-0 left-[-9999px]" aria-hidden>
        <CertificatePreviewPaper
          bodyHtml={draft.bodyHtml}
          type={draft.type}
          requireResidentPhoto={draft.requireResidentPhoto}
          showBarangayLogo={draft.showBarangayLogo}
          showMunicipalLogo={draft.showMunicipalLogo}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          logoSize={draft.logoSize}
          data={requestData}
          residentPhotoUrl={requestResidentPhotoUrl}
          ref={printPaperRef}
        />
      </div>

      <CertificatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        bodyHtml={draft.bodyHtml}
        type={draft.type}
        requireResidentPhoto={draft.requireResidentPhoto}
        showBarangayLogo={draft.showBarangayLogo}
        showMunicipalLogo={draft.showMunicipalLogo}
        showBarangayDrySeal={draft.showBarangayDrySeal}
        logoSize={draft.logoSize}
        data={requestData}
        residentPhotoUrl={requestResidentPhotoUrl}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Document"
        description="This will replace the current document with the default layout for this certificate type. Your custom edits will be lost."
        destructive
        confirmLabel="Reset"
        onConfirm={handleReset}
      />
    </div>
  )
}

export default function CertificateTemplatesPage() {
  return (
    <Suspense fallback={null}>
      <CertificateTemplatesPageContent />
    </Suspense>
  )
}
