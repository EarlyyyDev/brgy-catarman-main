"use client"

import { ArrowRight, BookOpen, MapPin } from "lucide-react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

const landmarkHighlights = [
  "Barangay Hall and civic center",
  "School zone and community learning hub",
  "Health center and emergency response routes",
  "Market area and public service corridors",
]

const barangayQuickStats = [
  { label: "Pop. Density", value: "11,840.19/Sq. Km" },
  { label: "Zip Code", value: "6017" },
]

export function About() {
  const { settings: systemSettings } = usePublicSettings()

  return (
    <section id="about" className="bg-gradient-to-b from-secondary/40 via-background to-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">About Barangay Catarman</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Serving Our Community Since {systemSettings.founded}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            A homegrown community rooted in service, resilience, and inclusive progress.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#emergency-hotlines"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Emergency Hotlines
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="mt-12 overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 bg-gradient-to-br from-primary/8 via-card to-gold/10 p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                <BookOpen className="size-4" />
                Our Story
              </div>
              <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                {systemSettings.historyText}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-[32px] border border-border bg-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
          <div className="mb-6 overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(17,94,89,0.18),_transparent_40%),linear-gradient(135deg,_rgba(248,250,252,0.95),_rgba(220,252,231,0.9))] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Official Barangay Profile</p>
                <h3 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Explore Catarman</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground shadow-sm">
                <MapPin className="size-4 text-primary" />
                {systemSettings.municipality}, {systemSettings.province}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {landmarkHighlights.map((item) => (
                <div key={item} className="rounded-2xl border border-border/80 bg-background/70 px-3 py-2 text-sm text-foreground/80 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
              <iframe
                title="Map of Barangay Catarman, Cordova, Cebu"
                src="https://www.google.com/maps?q=Barangay+Catarman%2C+Cordova%2C+Cebu%2C+Philippines&z=16&output=embed"
                className="h-[360px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Community Profile</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {systemSettings.barangayName} is a vibrant and service-oriented barangay located in {systemSettings.municipality}, {systemSettings.province}. It continues to strengthen local governance, public assistance, and community participation.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Address</p>
                <p className="mt-2 text-sm text-foreground/80">{systemSettings.fullAddress}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Barangay Facts</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {barangayQuickStats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-secondary/20 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-bold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
