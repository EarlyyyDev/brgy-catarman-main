"use client"

import { Phone } from "lucide-react"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { usePublicOfficials } from "@/lib/api/hooks/use-officials"

export function Officials() {
  const { officials } = usePublicOfficials()
  const [captain, ...rest] = officials

  return (
    <section id="officials" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Barangay Council</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Current Elected Officials</h2>
        <p className="mt-4 text-muted-foreground">Term of Office 2023 - 2026</p>
      </div>

      {captain ? (
        <Card className="mx-auto mt-12 max-w-md border-gold/40 bg-gradient-to-b from-gold-muted/60 to-card">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <InitialsAvatar name={captain.name} photoUrl={captain.photoUrl} size="xl" className="ring-4 ring-gold/30" />
            <h3 className="mt-4 font-heading text-xl font-bold text-foreground">{captain.name}</h3>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-foreground">{captain.position}</p>
            {captain.contactNumber ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {captain.contactNumber}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {rest.map((official) => (
          <Card key={official.id} className="border-border/70 text-center transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center p-5">
              <InitialsAvatar name={official.name} photoUrl={official.photoUrl} size="lg" />
              <h4 className="mt-3 text-sm font-semibold text-foreground">{official.name}</h4>
              <p className="mt-1 text-xs font-medium text-primary">{official.position}</p>
              {official.committee && official.committee !== "Executive" && official.committee !== "Administration" && official.committee !== "Finance" ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{official.committee}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
