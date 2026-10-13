"use client"

import { ArrowRight, Phone, Siren } from "lucide-react"
import { usePublicEmergencyContacts } from "@/lib/api/hooks/use-emergency-contacts"
import { Card, CardContent } from "@/components/ui/card"

export function EmergencyContactsSection() {
  const { emergencyContacts } = usePublicEmergencyContacts()
  const primaryHotline = emergencyContacts[0]

  return (
    <section
      id="emergency-hotlines"
      className="relative overflow-hidden bg-gradient-to-b from-[#05070a] via-[#150b0d] to-[#3b0b0d] py-24 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.25),_transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 ring-1 ring-red-400/20">
            <Siren className="size-7" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">24/7 emergency response</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Emergency Hotlines</h2>
          <p className="mt-3 text-base text-slate-200">Save these numbers — help is one call away, day or night.</p>
        </div>

        {primaryHotline ? (
          <div className="mt-10 flex justify-center">
            <a
              href={`tel:${primaryHotline.contactNumber.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400"
            >
              Call the hotline now
              <ArrowRight className="size-4" />
            </a>
          </div>
        ) : null}

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyContacts.map((contact) => (
            <Card key={contact.id} className="border-red-500/15 bg-black/20 text-white shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 ring-1 ring-red-400/20">
                  <Phone className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{contact.name}</p>
                  <a
                    href={`tel:${contact.contactNumber.replace(/[^\d+]/g, "")}`}
                    className="mt-1 block text-lg font-bold text-red-200 transition hover:text-white hover:underline"
                  >
                    {contact.contactNumber}
                  </a>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-200">{contact.category}</p>
                  <p className="mt-1 text-xs text-slate-200">{contact.availability}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
