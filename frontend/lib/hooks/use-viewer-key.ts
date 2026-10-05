"use client"

import * as React from "react"
import { useMe } from "@/lib/api/hooks/use-auth"

const GUEST_ID_KEY = "catarman-guest-id"

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "guest"
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = `guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

/** A stable identity to scope per-viewer state (post/comment reactions) by.
 * Logged-in staff/admins are scoped by their real account id, so reacting on
 * one account never bleeds into another account sharing the same browser.
 * Anonymous public visitors (no account) fall back to a generated id kept in
 * localStorage, so their own reactions still persist across visits.
 *
 * Pass forceAnonymous when rendering in the public-facing portal: the app has
 * a single shared login session with no notion of "which portal" it belongs
 * to, so a staff/admin merely being logged in (e.g. left signed in from an
 * earlier dashboard visit) must never leak into identity used for content
 * posted through the public site. */
export function useViewerKey(forceAnonymous = false): string {
  const { data: session } = useMe()
  const [guestId, setGuestId] = React.useState("guest")

  React.useEffect(() => {
    setGuestId(getOrCreateGuestId())
  }, [])

  if (forceAnonymous || !session) return guestId
  return session.id
}
