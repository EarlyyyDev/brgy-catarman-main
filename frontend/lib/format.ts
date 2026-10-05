import { format, formatDistanceStrict, isValid } from "date-fns"
import { getServerNow, toManilaCalendarKey } from "@/lib/server-clock"

export function formatDate(value?: string | Date, pattern = "MMM d, yyyy"): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  return format(date, pattern)
}

export function formatDateTime(value?: string | Date): string {
  return formatDate(value, "MMM d, yyyy 'at' h:mm a")
}

/** 0-59s -> "just now"; up to 6 days -> "N units ago" (formatDistanceStrict,
 * not formatDistance, so it reads "8 hours ago" rather than date-fns'
 * default "about 8 hours ago"); 7+ days -> an absolute date, so old posts
 * never get inflated into a misleadingly-recent-looking count of days. */
export function formatRelativeTime(value?: string | Date): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  const now = getServerNow()
  const diffSec = Math.abs(now.getTime() - date.getTime()) / 1000
  if (diffSec < 60) return "just now"
  if (diffSec >= 7 * 86400) return format(date, "MMM d, yyyy")
  return formatDistanceStrict(date, now, { addSuffix: true })
}

export function formatUpdatedLabel(value?: string | Date): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  const now = getServerNow()
  const dateKey = toManilaCalendarKey(date)
  if (dateKey === toManilaCalendarKey(now)) return "Today"
  if (dateKey === toManilaCalendarKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))) return "Yesterday"
  return formatRelativeTime(date)
}

export function formatPhone(value?: string): string {
  return value && value.length > 0 ? value : "—"
}

const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

export function formatCurrency(value?: string | number | null): string {
  const amount = typeof value === "string" ? Number(value) : (value ?? 0)
  if (!Number.isFinite(amount)) return currencyFormatter.format(0)
  return currencyFormatter.format(amount)
}
