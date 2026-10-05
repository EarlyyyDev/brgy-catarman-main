"use client"

import { Users, Building2, FileCheck2, ShieldCheck } from "lucide-react"
import { usePublicStats } from "@/lib/api/hooks/use-dashboard"

export function Stats() {
  const { stats } = usePublicStats()

  const items = [
    { label: "Registered Residents", value: (stats?.residents ?? 0).toLocaleString(), icon: Users },
    { label: "Households", value: (stats?.households ?? 0).toLocaleString(), icon: Building2 },
    { label: "Certificates Processed", value: (stats?.certificatesProcessed ?? 0).toLocaleString(), icon: FileCheck2 },
    { label: "Incidents Resolved", value: (stats?.incidentsResolved ?? 0).toLocaleString(), icon: ShieldCheck },
  ]

  return (
    <section className="relative -mt-14 z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        {items.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center sm:flex-row sm:text-left">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <stat.icon className="size-5" />
            </span>
            <span>
              <span className="block font-heading text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
