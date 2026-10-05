import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accent?: "navy" | "gold" | "success" | "warning" | "danger"
  className?: string
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  navy: "bg-primary/10 text-primary",
  gold: "bg-gold-muted text-gold-foreground",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
}

export function StatCard({ label, value, icon: Icon, trend, accent = "navy", className }: StatCardProps) {
  return (
    <Card className={cn("border-border/70 transition-shadow hover:shadow-md", className)}>
      <CardContent className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
          {trend ? (
            <p className={cn("flex items-center gap-1 text-xs font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
              {trend.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {trend.value}
            </p>
          ) : null}
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", ACCENT_CLASSES[accent])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
