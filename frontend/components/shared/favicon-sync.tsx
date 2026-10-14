"use client"

import * as React from "react"

const FAVICON_LINK_ID = "app-dynamic-favicon"
const DEFAULT_FAVICON = "/favicon.svg"

export function FaviconSync() {
  React.useEffect(() => {
    let link = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.id = FAVICON_LINK_ID
      link.rel = "icon"
      link.type = "image/svg+xml"
      document.head.appendChild(link)
    }

    link.href = DEFAULT_FAVICON
  }, [])

  return null
}
