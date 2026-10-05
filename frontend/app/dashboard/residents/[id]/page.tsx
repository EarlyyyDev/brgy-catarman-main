"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Mail, MapPin, Phone, Pencil, Printer, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { EmptyState } from "@/components/shared/empty-state"
import { ResidentFormDialog } from "@/components/dashboard/residents/resident-form-dialog"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useAllHouseholds } from "@/lib/api/hooks/use-households"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { formatDate } from "@/lib/format"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export default function ResidentProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { residents } = useAllResidents()
  const { households } = useAllHouseholds()
  const { settings } = usePublicSettings()
  const [editOpen, setEditOpen] = React.useState(false)

  const resident = residents.find((r) => r.id === params.id)
  const household = households.find((h) => h.id === resident?.householdId)

  if (!resident) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <EmptyState icon={ShieldAlert} title="Resident not found" description="This resident record may have been deleted or does not exist." />
      </div>
    )
  }

  const fullName = getResidentFullName(resident)

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back to Residents
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 hidden items-center gap-2 print:flex">
              <BarangaySeal className="size-8" />
              <span className="text-xs font-semibold uppercase tracking-wide">{settings.barangayName} — Resident ID</span>
            </div>
            <InitialsAvatar name={fullName} photoUrl={resident.photoUrl} size="xl" className="ring-4 ring-primary/15" />
            <h1 className="mt-4 font-heading text-xl font-bold text-foreground">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{resident.address.purok}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {resident.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-border p-3">
              <QRCodeSVG value={`BARANGAY-CATARMAN-RESIDENT:${resident.id}`} size={120} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Resident ID: {resident.id.toUpperCase()}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Personal Information</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <InfoField label="Gender" value={resident.gender} />
              <InfoField label="Birthdate" value={`${formatDate(resident.birthdate)} (${getResidentAge(resident.birthdate)} yrs old)`} />
              <InfoField label="Civil Status" value={resident.civilStatus} />
              <InfoField label="Religion" value={resident.religion} />
              <InfoField label="Occupation" value={resident.occupation} />
              <InfoField label="Educational Attainment" value={resident.educationalAttainment} />
              <InfoField label="Registered Voter" value={resident.isRegisteredVoter ? "Yes" : "No"} />
              <InfoField label="Household Number" value={household?.householdNumber} />
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact & Address</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {resident.address.houseNumber} {resident.address.street}, {resident.address.purok}, Barangay Catarman
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                {resident.contactNumber || "—"}
              </div>
              {resident.email ? (
                <div className="flex items-start gap-2.5 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  {resident.email}
                </div>
              ) : null}
            </div>

            {resident.emergencyContactName ? (
              <>
                <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Emergency Contact</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <InfoField label="Name" value={resident.emergencyContactName} />
                  <InfoField label="Contact Number" value={resident.emergencyContactNumber} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ResidentFormDialog open={editOpen} onOpenChange={setEditOpen} resident={resident} />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  )
}
