"use client"

import { Phone, Siren } from "lucide-react"
import { usePublicEmergencyContacts } from "@/lib/api/hooks/use-emergency-contacts"
import { Card, CardContent } from "@/components/ui/card"

export function EmergencyContactsSection() {
  const { emergencyContacts } = usePublicEmergencyContacts()

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <Siren className="size-6" />
        </div>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">Emergency Hotlines</h2>
        <p className="mt-3 text-muted-foreground">Save these numbers — help is one call away, day or night.</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {emergencyContacts.map((contact) => (
          <Card key={contact.id} className="border-border/70">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <Phone className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                <a href={`tel:${contact.contactNumber.replace(/[^\d+]/g, "")}`} className="mt-1 block text-lg font-bold text-primary hover:underline">
                  {contact.contactNumber}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{contact.availability}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
