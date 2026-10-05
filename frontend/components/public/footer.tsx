"use client"

import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { usePublicEmergencyContacts } from "@/lib/api/hooks/use-emergency-contacts"
import { usePublicDialogStore, type PublicDialogKey } from "@/lib/stores/public-dialog-store"

const QUICK_LINKS = [
  { label: "About Barangay Catarman", href: "/#about" },
  { label: "Barangay Officials", href: "/#officials" },
  { label: "Announcements", href: "/announcements" },
  { label: "Frequently Asked Questions", href: "/#faq" },
  { label: "Contact Us", href: "/#contact" },
]

const SERVICE_LINKS: { label: string; key: PublicDialogKey; href?: string }[] = [
  { label: "Request Document", key: "request-document" },
  { label: "Track Request", key: "track-request" },
  { label: "Report Incident", key: "report-incident" },
]

export function Footer() {
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)
  const { settings: systemSettings } = usePublicSettings()
  const { emergencyContacts } = usePublicEmergencyContacts()

  return (
    <footer
      className="border-t border-white/10 text-white/80"
      style={{ backgroundColor: "color-mix(in srgb, var(--primary) 85%, black)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <BarangaySeal />
              <div>
                <p className="font-heading text-lg font-bold text-white">e-Catarman</p>
                <p className="text-xs uppercase tracking-widest text-white/50">Digital Barangay Operations Management System</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              The official digital platform of Barangay Catarman for requesting documents, reporting incidents, and
              staying connected with community programs and announcements.
            </p>
            {systemSettings.facebookUrl ? (
              <div className="mt-5 flex items-center gap-3">
                <a
                  href={systemSettings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold hover:text-gold-foreground"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3-.04-1.3-.13-2.45-.13-2.43 0-4.1 1.48-4.1 4.2v2.3H7.4V13h2.75v8h3.35Z" />
                  </svg>
                </a>
              </div>
            ) : null}
          </div>

          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">Quick Links</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">Online Services</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  {link.key ? (
                    <button type="button" onClick={() => setOpenDialog(link.key)} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </button>
                  ) : (
                    <Link href={link.href!} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">Contact Information</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                {systemSettings.fullAddress}
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                {systemSettings.contactNumbers.join(" / ")}
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                {systemSettings.emailAddress}
              </li>
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-red-400">Emergency Hotline</p>
            <p className="text-sm font-semibold text-white">{emergencyContacts[0]?.contactNumber}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Barangay Catarman. All rights reserved.</p>
          <p>Built for transparent and efficient local governance.</p>
        </div>
      </div>
    </footer>
  )
}
