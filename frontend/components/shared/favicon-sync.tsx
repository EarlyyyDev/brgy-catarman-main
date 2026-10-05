"use client"

import * as React from "react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

const FAVICON_LINK_ID = "app-dynamic-favicon"
const DEFAULT_FAVICON = "/catarman-logo.jpg"

export function FaviconSync() {
  const { settings } = usePublicSettings()
  const logoUrl = settings.logoUrl

  React.useEffect(() => {
    let link = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.id = FAVICON_LINK_ID
      link.rel = "icon"
      document.head.appendChild(link)
    }
    link.href = logoUrl || DEFAULT_FAVICON
  }, [logoUrl])

  return null
}
