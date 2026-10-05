"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { ArrowLeft, Download, Eye, Plus, Printer, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { BlotterDocumentEditor } from "@/components/dashboard/blotter-templates/blotter-document-editor"
import { BlotterPreviewPaper } from "@/components/dashboard/blotter-templates/blotter-preview-paper"
import { BlotterTemplateSettingsBar } from "@/components/dashboard/blotter-templates/blotter-template-settings-bar"
import { BlotterPreviewDialog } from "@/components/dashboard/blotter-templates/blotter-mobile-preview-sheet"
import { ScaledDocumentPreview } from "@/components/shared/scaled-document-preview"
import { useBlotterTemplates, useAddBlotterTemplate, useUpdateBlotterTemplate } from "@/lib/api/hooks/use-blotter-templates"
import { useAllBlotters } from "@/lib/api/hooks/use-blotters"
import { usePublicSettings, useUpdateSettings } from "@/lib/api/hooks/use-settings"
import { usePublicOfficials } from "@/lib/api/hooks/use-officials"
import { ApiError } from "@/lib/api/types"
import { getDefaultBlotterTemplateBodyHtml } from "@/data/blotter-template-defaults"
import { buildBlotterData } from "@/lib/blotter-placeholders"
import { exportElementAsPdf } from "@/lib/export-pdf"
import type { BlotterTemplate, BlotterTemplateStatus, UploadedFile } from "@/types"

const MIN_LOGO_SIZE = 40
const MAX_LOGO_SIZE = 120

function blankDraft() {
  return {
    name: "New Blotter Template",
    status: "Active" as BlotterTemplateStatus,
    showBarangayLogo: true,
    showMunicipalLogo: true,
    showBarangayDrySeal: true,
    logoSize: 64,
    bodyHtml: getDefaultBlotterTemplateBodyHtml(),
  }
}

function BlotterTemplatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blotterId = searchParams.get("blotterId")
  const { templates } = useBlotterTemplates()
  const addTemplate = useAddBlotterTemplate()
  const updateTemplate = useUpdateBlotterTemplate()
  const { blotters } = useAllBlotters()
  const { settings } = usePublicSettings()
  const updateSettingsMutation = useUpdateSettings()
  const { officials } = usePublicOfficials()

  const activeBlotter = blotterId ? blotters.find((b) => b.id === blotterId) : undefined
  const caseData = activeBlotter ? buildBlotterData(activeBlotter, officials, settings) : undefined

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

  function saveBlotterLogos() {
    updateSettingsMutation.mutate(
      {
        documentLogoUrl: barangayLogoFiles[0]?.url ?? settings.documentLogoUrl,
        municipalLogoUrl: municipalLogoFiles[0]?.url ?? settings.municipalLogoUrl,
      },
      { onSuccess: () => toast.success("Logos updated.") },
    )
  }

  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(templates[0]?.id ?? null)
  const [draft, setDraft] = React.useState(() => (templates[0] ? { ...templates[0] } : blankDraft()))
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const printPaperRef = React.useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = React.useState(false)

  // When arriving with ?blotterId=..., load the active template so staff
  // land straight on the real case data instead of a blank builder.
  React.useEffect(() => {
    if (!activeBlotter) return
    const match = templates.find((t) => t.status === "Active") ?? templates[0]
    if (match) {
      setSelectedTemplateId(match.id)
      setDraft({ ...match })
    } else {
      toast.error("No blotter template found.")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlotter?.id])

  function loadTemplate(template: BlotterTemplate) {
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
      setDraft(blankDraft())
    }
    toast.success("Changes discarded.")
  }

  function handleReset() {
    setDraft((prev) => ({ ...prev, bodyHtml: getDefaultBlotterTemplateBodyHtml() }))
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
      status: draft.status,
      showBarangayLogo: draft.showBarangayLogo,
      showMunicipalLogo: draft.showMunicipalLogo,
      showBarangayDrySeal: draft.showBarangayDrySeal,
      logoSize: draft.logoSize,
      bodyHtml: draft.bodyHtml,
    }

    try {
      if (selectedTemplateId) {
        await updateTemplate.mutateAsync({ id: selectedTemplateId, values })
      } else {
        const created = await addTemplate.mutateAsync(values)
        setSelectedTemplateId(created.id)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save template.")
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleExportPdf() {
    if (!printPaperRef.current) return
    setExporting(true)
    try {
      await exportElementAsPdf(printPaperRef.current, `${draft.name || "blotter-template"}.pdf`)
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
        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/dashboard/blotters")} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Blotter Template Builder</h1>
                <p className="text-sm text-muted-foreground">Create and manage reusable blotter case record templates.</p>
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

        {activeBlotter ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm text-foreground">
              Printing case record for <span className="font-semibold">{activeBlotter.complainantName}</span> vs.{" "}
              <span className="font-semibold">{activeBlotter.respondentName}</span> · Case{" "}
              <span className="font-mono">{activeBlotter.caseNumber}</span>
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/blotter-templates")}>
              <X className="size-3.5" />
              Exit case mode
            </Button>
          </div>
        ) : null}

        <BlotterTemplateSettingsBar
          name={draft.name}
          onNameChange={(name) => setDraft((prev) => ({ ...prev, name }))}
          status={draft.status}
          onStatusChange={(status) => setDraft((prev) => ({ ...prev, status }))}
          showBarangayLogo={draft.showBarangayLogo}
          onShowBarangayLogoChange={(showBarangayLogo) => setDraft((prev) => ({ ...prev, showBarangayLogo }))}
          showMunicipalLogo={draft.showMunicipalLogo}
          onShowMunicipalLogoChange={(showMunicipalLogo) => setDraft((prev) => ({ ...prev, showMunicipalLogo }))}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          onShowBarangayDrySealChange={(showBarangayDrySeal) => setDraft((prev) => ({ ...prev, showBarangayDrySeal }))}
        />

        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Barangay & Municipal Logos</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Upload the actual seal photos used for the logo placeholders above. These are used on printed blotter records only and are shared with the Certificate Template Builder — they do not change the site&apos;s main logo in System Settings.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileDropzone label="Upload Municipal Logo" accept="image/*" multiple={false} value={municipalLogoFiles} onChange={setMunicipalLogoFiles} />
            <FileDropzone label="Upload Barangay Logo" accept="image/*" multiple={false} value={barangayLogoFiles} onChange={setBarangayLogoFiles} />
          </div>

          <div className="mt-4 space-y-1.5 border-t border-border pt-4">
            <Label className="text-xs font-medium text-muted-foreground">Logo Size ({draft.logoSize}px)</Label>
            <div className="flex max-w-sm items-center gap-3">
              <Slider
                value={[draft.logoSize]}
                min={MIN_LOGO_SIZE}
                max={MAX_LOGO_SIZE}
                step={4}
                onValueChange={([v]) => setDraft((prev) => ({ ...prev, logoSize: v }))}
              />
            </div>
          </div>

          <Button type="button" className="mt-3" onClick={saveBlotterLogos}>
            Save Logos
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BlotterDocumentEditor html={draft.bodyHtml} onChange={(bodyHtml) => setDraft((prev) => ({ ...prev, bodyHtml }))} />
          </div>

          <div className="hidden min-w-0 lg:col-span-2 lg:block">
            <div className="sticky top-40 space-y-3">
              <p className="font-heading text-sm font-semibold text-foreground">Live Blotter Preview</p>
              <div className="min-w-0 rounded-xl border border-border bg-secondary/30 p-4">
                <ScaledDocumentPreview>
                  <BlotterPreviewPaper
                    bodyHtml={draft.bodyHtml}
                    showBarangayLogo={draft.showBarangayLogo}
                    showMunicipalLogo={draft.showMunicipalLogo}
                    showBarangayDrySeal={draft.showBarangayDrySeal}
                    logoSize={draft.logoSize}
                    data={caseData}
                    hearings={activeBlotter?.hearings}
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
        <BlotterPreviewPaper
          bodyHtml={draft.bodyHtml}
          showBarangayLogo={draft.showBarangayLogo}
          showMunicipalLogo={draft.showMunicipalLogo}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          logoSize={draft.logoSize}
          data={caseData}
          hearings={activeBlotter?.hearings}
        />
      </div>

      {/* Export-only copy, kept off-screen at natural size: the visible Live Preview
          above can be scaled down to fit small screens, but html2canvas captures
          whatever size an element is actually rendered at, so PDF export must read
          from a copy that's never visually scaled. */}
      <div className="pointer-events-none fixed top-0 left-[-9999px]" aria-hidden>
        <BlotterPreviewPaper
          bodyHtml={draft.bodyHtml}
          showBarangayLogo={draft.showBarangayLogo}
          showMunicipalLogo={draft.showMunicipalLogo}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          logoSize={draft.logoSize}
          data={caseData}
          hearings={activeBlotter?.hearings}
          ref={printPaperRef}
        />
      </div>

      <BlotterPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        bodyHtml={draft.bodyHtml}
        showBarangayLogo={draft.showBarangayLogo}
        showMunicipalLogo={draft.showMunicipalLogo}
        showBarangayDrySeal={draft.showBarangayDrySeal}
        logoSize={draft.logoSize}
        data={caseData}
        hearings={activeBlotter?.hearings}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Document"
        description="This will replace the current document with the default layout. Your custom edits will be lost."
        destructive
        confirmLabel="Reset"
        onConfirm={handleReset}
      />
    </div>
  )
}

export default function BlotterTemplatesPage() {
  return (
    <Suspense fallback={null}>
      <BlotterTemplatesPageContent />
    </Suspense>
  )
}
