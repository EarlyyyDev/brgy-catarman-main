"use client"

import { usePublicDialogStore } from "@/lib/stores/public-dialog-store"
import { RequestDocumentDialog } from "@/components/public/request-document-dialog"
import { TrackRequestDialog } from "@/components/public/track-request-dialog"
import { ReportIncidentDialog } from "@/components/public/report-incident-dialog"

/** Mounted once at the public layout level so the Request Document, Track
 * Request, and Report Incident flows can be opened as an overlay from
 * anywhere on the public site (navbar, hero, footer, services section)
 * without navigating to a separate page. */
export function PublicActionDialogs() {
  const openDialog = usePublicDialogStore((s) => s.openDialog)
  const trackRef = usePublicDialogStore((s) => s.trackRef)
  const closeDialog = usePublicDialogStore((s) => s.closeDialog)

  return (
    <>
      <RequestDocumentDialog open={openDialog === "request-document"} onOpenChange={(next) => !next && closeDialog()} />
      <TrackRequestDialog open={openDialog === "track-request"} onOpenChange={(next) => !next && closeDialog()} initialRef={trackRef} />
      <ReportIncidentDialog open={openDialog === "report-incident"} onOpenChange={(next) => !next && closeDialog()} />
    </>
  )
}
