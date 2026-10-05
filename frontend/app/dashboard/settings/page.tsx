"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Banknote, Building, Mail, Palette, Pencil, Phone, Plus, Trash2, Users2, Wrench } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { OfficialFormDialog } from "@/components/dashboard/settings/official-form-dialog"
import { MyAccountSettings } from "@/components/dashboard/settings/my-account-settings"
import { CertificatePricingForm } from "@/components/dashboard/settings/certificate-pricing-form"
import { useSettings, useUpdateSettings, useUploadSettingsImage } from "@/lib/api/hooks/use-settings"
import { useOfficials, useDeleteOfficial } from "@/lib/api/hooks/use-officials"
import { useMe } from "@/lib/api/hooks/use-auth"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import type { Official, SystemSettings, UploadedFile } from "@/types"

export default function SettingsPage() {
  const { data: session } = useMe()

  if (session && session.role !== "Administrator") {
    return <MyAccountSettings />
  }

  return <SystemSettingsPage />
}

function SystemSettingsPage() {
  const { settings } = useSettings()
  const { officials } = useOfficials()
  const updateSettingsMutation = useUpdateSettings()
  const deleteOfficialMutation = useDeleteOfficial()
  const uploadImage = useUploadSettingsImage()
  const updateSettings = (values: Partial<SystemSettings>) => updateSettingsMutation.mutate(values)

  /** FileDropzone only ever produces local base64 data: URLs -- these must be
   * uploaded to get a real, persistable URL before saving. An already-real
   * URL (the existing image, left untouched) is passed through as-is. */
  async function resolveImageUrl(files: UploadedFile[], fallback: string): Promise<string> {
    const file = files[0]
    if (!file) return fallback
    if (!file.url.startsWith("data:")) return file.url
    const { url } = await uploadImage.mutateAsync(dataUrlToFile(file.url, file.name))
    return url
  }

  const { register, handleSubmit, reset } = useForm<SystemSettings>({ defaultValues: settings })
  React.useEffect(() => reset(settings), [settings, reset])

  const [logo, setLogo] = React.useState<UploadedFile[]>([])
  const [seal, setSeal] = React.useState<UploadedFile[]>([])
  const [municipalLogo, setMunicipalLogo] = React.useState<UploadedFile[]>(
    settings.municipalLogoUrl
      ? [{ id: "existing-municipal-logo", name: "municipal-logo", url: settings.municipalLogoUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }]
      : []
  )
  const [heroBg, setHeroBg] = React.useState<UploadedFile[]>(
    settings.heroBackgroundUrl ? [{ id: "existing-hero-bg", name: "hero-background", url: settings.heroBackgroundUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }] : []
  )
  const [loginBg, setLoginBg] = React.useState<UploadedFile[]>(
    settings.loginBackgroundUrl ? [{ id: "existing-login-bg", name: "login-background", url: settings.loginBackgroundUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }] : []
  )
  const [aiAvatar, setAiAvatar] = React.useState<UploadedFile[]>(
    settings.aiAssistantAvatarUrl
      ? [{ id: "existing-ai-avatar", name: "ai-assistant-avatar", url: settings.aiAssistantAvatarUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }]
      : []
  )
  const [officialFormOpen, setOfficialFormOpen] = React.useState(false)
  const [editingOfficial, setEditingOfficial] = React.useState<Official | undefined>()
  const [deletingOfficialId, setDeletingOfficialId] = React.useState<string | null>(null)

  // Goals/objectives are variable-length lists -- edited as one item per
  // line rather than building a full dynamic add/remove row UI for them.
  const [goalsText, setGoalsText] = React.useState(settings.goals.join("\n"))
  const [objectivesText, setObjectivesText] = React.useState(settings.objectives.join("\n"))
  React.useEffect(() => {
    setGoalsText(settings.goals.join("\n"))
    setObjectivesText(settings.objectives.join("\n"))
  }, [settings.goals, settings.objectives])

  function onSaveGeneral(values: SystemSettings) {
    updateSettingsMutation.mutate(
      {
        ...values,
        goals: goalsText.split("\n").map((line) => line.trim()).filter(Boolean),
        objectives: objectivesText.split("\n").map((line) => line.trim()).filter(Boolean),
      },
      { onSuccess: () => toast.success("Barangay information updated.") },
    )
  }

  async function saveLogos() {
    const [logoUrl, sealUrl, municipalLogoUrl] = await Promise.all([
      resolveImageUrl(logo, settings.logoUrl),
      resolveImageUrl(seal, settings.sealUrl),
      resolveImageUrl(municipalLogo, settings.municipalLogoUrl ?? ""),
    ])
    updateSettings({ logoUrl, sealUrl, municipalLogoUrl })
    toast.success("Logo and seal updated.")
  }

  function saveTheme(primary: string, accent: string) {
    updateSettings({ themePrimaryColor: primary, themeAccentColor: accent })
    toast.success("Theme colors applied.")
  }

  function saveMaintenance(enabled: boolean, message: string) {
    updateSettings({ maintenanceMode: enabled, maintenanceMessage: message })
    toast.success(enabled ? "Maintenance mode enabled. The public site now shows a maintenance notice." : "Maintenance mode disabled. The public site is live again.")
  }

  async function saveHeroBackground() {
    const heroBackgroundUrl = await resolveImageUrl(heroBg, settings.heroBackgroundUrl ?? "")
    updateSettings({ heroBackgroundUrl })
    toast.success("Homepage background photo updated.")
  }

  async function saveLoginBackground() {
    const loginBackgroundUrl = await resolveImageUrl(loginBg, settings.loginBackgroundUrl ?? "")
    updateSettings({ loginBackgroundUrl })
    toast.success("Login page background photo updated.")
  }

  async function saveAiAvatar() {
    const aiAssistantAvatarUrl = await resolveImageUrl(aiAvatar, settings.aiAssistantAvatarUrl ?? "")
    updateSettings({ aiAssistantAvatarUrl })
    toast.success("AI assistant chathead picture updated.")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure barangay information, officials, and system preferences." />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Building className="size-4" />
            Barangay Info
          </TabsTrigger>
          <TabsTrigger value="officials">
            <Users2 className="size-4" />
            Officials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="size-4" />
            Contact & Email
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="size-4" />
            Theme & Branding
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <Banknote className="size-4" />
            Certificate Pricing
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="size-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <form onSubmit={handleSubmit(onSaveGeneral)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Barangay Name</Label>
                    <Input className="mt-1.5" {...register("barangayName")} />
                  </div>
                  <div>
                    <Label>Municipality</Label>
                    <Input className="mt-1.5" {...register("municipality")} />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input className="mt-1.5" {...register("province")} />
                  </div>
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Input className="mt-1.5" {...register("fullAddress")} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Founded</Label>
                    <Input className="mt-1.5" {...register("founded")} />
                  </div>
                  <div>
                    <Label>Population</Label>
                    <Input className="mt-1.5" {...register("population")} />
                  </div>
                  <div>
                    <Label>Land Area</Label>
                    <Input className="mt-1.5" {...register("landArea")} />
                  </div>
                </div>
                <div>
                  <Label>Mission Statement</Label>
                  <Textarea className="mt-1.5" rows={3} {...register("missionStatement")} />
                </div>
                <div>
                  <Label>Vision Statement</Label>
                  <Textarea className="mt-1.5" rows={3} {...register("visionStatement")} />
                </div>
                <div>
                  <Label>History</Label>
                  <Textarea className="mt-1.5" rows={4} {...register("historyText")} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Goals</Label>
                    <Textarea
                      className="mt-1.5"
                      rows={5}
                      placeholder={"One goal per line, e.g.\nStrengthen transparent governance"}
                      value={goalsText}
                      onChange={(e) => setGoalsText(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">One goal per line.</p>
                  </div>
                  <div>
                    <Label>Objectives</Label>
                    <Textarea
                      className="mt-1.5"
                      rows={5}
                      placeholder={"One objective per line, e.g.\nDeliver quality public services"}
                      value={objectivesText}
                      onChange={(e) => setObjectivesText(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">One objective per line.</p>
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officials">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="mb-4 flex justify-end">
                <Button onClick={() => { setEditingOfficial(undefined); setOfficialFormOpen(true) }}>
                  <Plus className="size-4" />
                  Add Official
                </Button>
              </div>
              <div className="space-y-2">
                {officials.map((official) => (
                  <div key={official.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <InitialsAvatar name={official.name} photoUrl={official.photoUrl} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{official.name}</p>
                      <p className="text-xs text-muted-foreground">{official.position}{official.committee ? ` · ${official.committee}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingOfficial(official); setOfficialFormOpen(true) }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingOfficialId(official.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <form onSubmit={handleSubmit(onSaveGeneral)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Primary Contact Number</Label>
                    <Input className="mt-1.5" defaultValue={settings.contactNumbers[0]} {...register("contactNumbers.0")} />
                  </div>
                  <div>
                    <Label>Secondary Contact Number</Label>
                    <Input className="mt-1.5" defaultValue={settings.contactNumbers[1]} {...register("contactNumbers.1")} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input className="mt-1.5" {...register("emailAddress")} />
                </div>
                <div>
                  <Label>Office Hours</Label>
                  <Input className="mt-1.5" {...register("officeHours")} />
                </div>
                <div>
                  <Label>Facebook Page URL</Label>
                  <Input className="mt-1.5" placeholder="https://facebook.com/YourBarangayPage" {...register("facebookUrl")} />
                  <p className="mt-1 text-xs text-muted-foreground">Shown as the Facebook icon link in the public site&apos;s footer. Leave blank to hide it.</p>
                </div>
                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Mail className="size-4" />
                    SMTP Email Configuration
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input className="mt-1.5" {...register("smtpHost")} />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input className="mt-1.5" {...register("smtpPort")} />
                    </div>
                    <div>
                      <Label>SMTP Username</Label>
                      <Input className="mt-1.5" {...register("smtpUsername")} />
                    </div>
                    <div>
                      <Label>Sender Name</Label>
                      <Input className="mt-1.5" {...register("smtpSenderName")} />
                    </div>
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="border-border/70">
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Barangay Logo & Seal</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  The uploaded logo replaces the default barangay seal shown across the site — navbar, sidebar, and login page. Leave empty to keep the default seal. To set the logo used on printed certificates and blotter records, upload it from the Certificate or Blotter Template Builder instead.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FileDropzone label="Upload Logo" accept="image/*" multiple={false} value={logo} onChange={setLogo} />
                  <FileDropzone label="Upload Official Seal" accept="image/*" multiple={false} value={seal} onChange={setSeal} />
                  <FileDropzone label="Upload Municipal Logo" accept="image/*" multiple={false} value={municipalLogo} onChange={setMunicipalLogo} />
                </div>
                <Button className="mt-3" onClick={saveLogos}>
                  Save Logo & Seal
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Homepage Background Photo</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Replaces the illustrated Barangay Hall backdrop behind the homepage hero section. Leave empty to use the default illustration.
                </p>
                <FileDropzone label="Upload Background Photo" accept="image/*" multiple={false} value={heroBg} onChange={setHeroBg} />
                <Button className="mt-3" onClick={saveHeroBackground}>
                  Save Background Photo
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Login Page Background Photo</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Replaces the navy gradient backdrop behind the branding panel on the staff/admin login page. Leave empty to use the default gradient.
                </p>
                <FileDropzone label="Upload Background Photo" accept="image/*" multiple={false} value={loginBg} onChange={setLoginBg} />
                <Button className="mt-3" onClick={saveLoginBackground}>
                  Save Background Photo
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">AI Assistant Chathead</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Sets the picture shown on the floating chat bubble for the public-facing AI assistant. Leave empty to use the default bot icon.
                </p>
                <FileDropzone label="Upload Chathead Picture" accept="image/*" multiple={false} value={aiAvatar} onChange={setAiAvatar} />
                <Button className="mt-3" onClick={saveAiAvatar}>
                  Save Chathead Picture
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Website Theme Colors</p>
                <ThemeColorForm settings={settings} onSave={saveTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <CertificatePricingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <MaintenanceForm settings={settings} onSave={saveMaintenance} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OfficialFormDialog open={officialFormOpen} onOpenChange={setOfficialFormOpen} official={editingOfficial} />

      <ConfirmDialog
        open={!!deletingOfficialId}
        onOpenChange={(open) => !open && setDeletingOfficialId(null)}
        title="Remove Official"
        description="This will remove this official from the barangay council listing."
        destructive
        confirmLabel="Remove"
        onConfirm={() => {
          if (deletingOfficialId) deleteOfficialMutation.mutate(deletingOfficialId)
        }}
      />
    </div>
  )
}

function ThemeColorForm({ settings, onSave }: { settings: SystemSettings; onSave: (primary: string, accent: string) => void }) {
  const [primary, setPrimary] = React.useState(settings.themePrimaryColor)
  const [accent, setAccent] = React.useState(settings.themeAccentColor)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Primary Color</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="size-9 cursor-pointer rounded border border-input" />
            <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Accent Color</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-9 cursor-pointer rounded border border-input" />
            <Input value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </div>
      </div>
      <Button onClick={() => onSave(primary, accent)}>Apply Theme</Button>
    </div>
  )
}

function MaintenanceForm({ settings, onSave }: { settings: SystemSettings; onSave: (enabled: boolean, message: string) => void }) {
  const [enabled, setEnabled] = React.useState(settings.maintenanceMode)
  const [message, setMessage] = React.useState(settings.maintenanceMessage)

  React.useEffect(() => {
    setEnabled(settings.maintenanceMode)
    setMessage(settings.maintenanceMessage)
  }, [settings.maintenanceMode, settings.maintenanceMessage])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Maintenance Mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            When turned on, residents visiting the public website see a maintenance notice instead of the site.
            Staff and admin dashboard access is never affected — you can always log in and turn this back off.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled ? (
        <p className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-medium text-foreground">
          Maintenance mode is ON — the public website is currently showing the maintenance notice below.
        </p>
      ) : null}
      <div>
        <Label>Maintenance Message (optional)</Label>
        <Textarea
          className="mt-1.5"
          rows={3}
          placeholder="We're performing scheduled maintenance to improve our services. Please check back shortly."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">Shown to residents on the maintenance screen. Leave blank to use the default message.</p>
      </div>
      <Button onClick={() => onSave(enabled, message)}>Save Maintenance Settings</Button>
    </div>
  )
}
