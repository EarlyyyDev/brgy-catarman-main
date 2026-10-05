"use client"

import * as React from "react"
import { formatRelativeTime } from "@/lib/format"

/** Live-updating relative-time text: "just now" -> "1 minute ago" -> "2
 * minutes ago" etc. advance on their own, without a page refresh, by
 * re-rendering the calling component every 30s. */
export function useRelativeTime(value?: string | Date): string {
  const [, tick] = React.useReducer((n: number) => n + 1, 0)

  React.useEffect(() => {
    const id = setInterval(() => tick(), 30_000)
    return () => clearInterval(id)
  }, [])

  return formatRelativeTime(value)
}
