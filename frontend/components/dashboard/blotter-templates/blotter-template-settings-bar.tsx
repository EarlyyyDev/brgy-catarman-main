"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { BlotterTemplateStatus } from "@/types"

interface BlotterTemplateSettingsBarProps {
  name: string
  onNameChange: (value: string) => void
  status: BlotterTemplateStatus
  onStatusChange: (value: BlotterTemplateStatus) => void
  showBarangayLogo: boolean
  onShowBarangayLogoChange: (value: boolean) => void
  showMunicipalLogo: boolean
  onShowMunicipalLogoChange: (value: boolean) => void
  showBarangayDrySeal: boolean
  onShowBarangayDrySealChange: (value: boolean) => void
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-3">
        <Switch checked={checked} onCheckedChange={onChange} />
        <span className="text-sm font-medium">{checked ? "Yes" : "No"}</span>
      </div>
    </div>
  )
}

export function BlotterTemplateSettingsBar({
  name,
  onNameChange,
  status,
  onStatusChange,
  showBarangayLogo,
  onShowBarangayLogoChange,
  showMunicipalLogo,
  onShowMunicipalLogoChange,
  showBarangayDrySeal,
  onShowBarangayDrySealChange,
}: BlotterTemplateSettingsBarProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5 lg:col-span-1">
          <Label className="text-xs font-medium text-muted-foreground">Template Name</Label>
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Standard Blotter Report" className="h-10" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as BlotterTemplateStatus)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ToggleField label="Show Barangay Logo" checked={showBarangayLogo} onChange={onShowBarangayLogoChange} />
        <ToggleField label="Show Municipal Logo" checked={showMunicipalLogo} onChange={onShowMunicipalLogoChange} />
        <ToggleField label="Show Barangay Dry Seal" checked={showBarangayDrySeal} onChange={onShowBarangayDrySealChange} />
      </div>
    </div>
  )
}
