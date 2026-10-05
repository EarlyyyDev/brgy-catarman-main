import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ToneKey =
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "danger"
  | "gold"
  | "muted"

const TONE_CLASSES: Record<ToneKey, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  gold: "bg-gold-muted text-gold-foreground border-gold/40",
  muted: "bg-muted text-muted-foreground border-border",
}

const STATUS_TONE: Record<string, ToneKey> = {
  // Certificate statuses
  Pending: "neutral",
  Processing: "info",
  Approved: "success",
  Rejected: "danger",
  "Ready for Claim": "gold",
  Claimed: "success",
  // Complaint statuses
  New: "info",
  Validated: "gold",
  Resolved: "success",
  Archived: "muted",
  Dismissed: "danger",
  // Blotter statuses
  Open: "info",
  "Under Mediation": "warning",
  Settled: "success",
  "Escalated to Court": "danger",
  Closed: "muted",
  // Staff / general statuses
  Active: "success",
  Disabled: "danger",
  Draft: "muted",
  Scheduled: "info",
  Published: "success",
  Success: "success",
  Failed: "danger",
  Completed: "success",
  "In Progress": "info",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tone = STATUS_TONE[status] ?? "neutral"
  return (
    <Badge variant="outline" className={cn("font-medium whitespace-nowrap", TONE_CLASSES[tone], className)}>
      {status}
    </Badge>
  )
}
