"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RESIDENT_TAGS } from "@/lib/constants"

export function ResidentsByTagChart({ counts }: { counts: Record<string, number> }) {
  const data = React.useMemo(() => {
    const rows = RESIDENT_TAGS.map((tag) => {
      const key = tag === "4Ps Beneficiary" ? "FOUR_PS_BENEFICIARY" : tag.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
      return { tag, count: counts[key] ?? counts[tag] ?? 0 }
    })
    const max = Math.max(...rows.map((row) => row.count), 1)
    return rows.map((row) => ({ ...row, pct: Math.round((row.count / max) * 100) }))
  }, [counts])

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Residents by Tag</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((row) => (
          <div key={row.tag}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-foreground">{row.tag}</span>
              <span className="font-semibold text-foreground">{row.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gold" style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
