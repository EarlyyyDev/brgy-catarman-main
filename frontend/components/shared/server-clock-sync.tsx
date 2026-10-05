"use client"

import * as React from "react"
import { syncServerClock } from "@/lib/server-clock"

/** Anchors this device's relative-time calculations to the server's clock --
 * see lib/server-clock.ts. Re-syncs on tab refocus too, since a tab left
 * open for a long time gives the device's own clock more chance to drift. */
export function ServerClockSync() {
  React.useEffect(() => {
    syncServerClock()
    function onFocus() {
      syncServerClock()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  return null
}
