"use client"

import { BookOpen } from "lucide-react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export function About() {
  const { settings: systemSettings } = usePublicSettings()
  return (
    <section id="about" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">About Barangay Catarman</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Serving Our Community Since {systemSettings.founded}
          </h2>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-10">
          <div className="grid grid-cols-3 gap-1 text-center sm:gap-4">
            <div>
              <p className="font-heading text-lg font-bold text-foreground sm:text-3xl">{systemSettings.founded}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">Founded</p>
            </div>
            <div className="border-x border-border">
              <p className="font-heading text-lg font-bold text-foreground sm:text-3xl">{systemSettings.population}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">Population</p>
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-foreground sm:text-3xl">{systemSettings.landArea}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">Land Area</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="size-4 text-primary" />
              Our History
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
              {systemSettings.historyText}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
