"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { RESIDENT_TAGS } from "@/lib/constants"

export function ResidentsByTagChart() {
  const { residents } = useAllResidents()

  const data = React.useMemo(() => {
    const counts = RESIDENT_TAGS.map((tag) => ({ tag, count: residents.filter((r) => r.tags.includes(tag)).length }))
    const max = Math.max(...counts.map((c) => c.count), 1)
    return counts.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }))
  }, [residents])

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
