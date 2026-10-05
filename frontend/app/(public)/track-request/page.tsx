"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePublicDialogStore } from "@/lib/stores/public-dialog-store"

/** This flow now opens as an overlay on top of wherever the visitor already
 * is, rather than as its own page -- see PublicActionDialogs. This route is
 * kept only so existing/bookmarked links (including ?ref=... deep links)
 * still work. */
function TrackRequestRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  React.useEffect(() => {
    setOpenDialog("track-request", searchParams.get("ref") ?? "")
    router.replace("/")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function TrackRequestRedirect() {
  return (
    <Suspense fallback={null}>
      <TrackRequestRedirectContent />
    </Suspense>
  )
}
