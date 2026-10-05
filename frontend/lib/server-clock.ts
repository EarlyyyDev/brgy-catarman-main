import { apiFetch } from "@/lib/api/client"

/**
 * A visitor's own device clock can be wrong (seen in the wild: an Android
 * phone with stale network time sync showed "8 hours ago" for a comment
 * posted a minute earlier -- exactly the Philippines' UTC+8 offset). Every
 * relative-time helper in lib/format.ts implicitly trusted that device's own
 * Date.now(), so a bad device clock directly corrupted what residents saw.
 *
 * The backend's clock (Neon/Express, NTP-synced) is authoritative. This
 * tracks the gap between that trusted server time and this device's own
 * clock, so relative-time math can use "what the server would say right
 * now" instead of blindly trusting the device.
 */
let offsetMs = 0

export async function syncServerClock(): Promise<void> {
  try {
    const { timestamp } = await apiFetch<{ timestamp: string }>("/health")
    offsetMs = new Date(timestamp).getTime() - Date.now()
  } catch {
    // Backend unreachable -- fall back to trusting the device clock
    // (offsetMs stays whatever it last was, or 0) rather than blocking on it.
  }
}

/** "Now", corrected for this device's clock skew against the server. */
export function getServerNow(): Date {
  return new Date(Date.now() + offsetMs)
}

/** The Philippines/Singapore offset (UTC+8, no DST) used to anchor calendar-day
 * labels ("Today"/"Yesterday") to Manila time regardless of the viewing
 * device's own timezone setting. */
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000

export function toManilaCalendarKey(date: Date): string {
  const shifted = new Date(date.getTime() + MANILA_OFFSET_MS)
  return `${shifted.getUTCFullYear()}-${shifted.getUTCMonth()}-${shifted.getUTCDate()}`
}
