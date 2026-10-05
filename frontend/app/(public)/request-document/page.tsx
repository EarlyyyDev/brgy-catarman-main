"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { usePublicDialogStore } from "@/lib/stores/public-dialog-store"

/** This flow now opens as an overlay on top of wherever the visitor already
 * is, rather than as its own page -- see PublicActionDialogs. This route is
 * kept only so existing/bookmarked links to /request-document still work. */
export default function RequestDocumentRedirect() {
  const router = useRouter()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  React.useEffect(() => {
    setOpenDialog("request-document")
    router.replace("/")
  }, [router, setOpenDialog])

  return null
}
