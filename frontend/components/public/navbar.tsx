"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Menu, Search, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { AnnouncementTicker } from "@/components/public/announcement-ticker"
import { usePublicDialogStore, type PublicDialogKey } from "@/lib/stores/public-dialog-store"

const NAV_LINKS = [
  { label: "Home", href: "/#hero" },
  { label: "About", href: "/#about" },
  { label: "Officials", href: "/#officials" },
  { label: "Announcements", href: "/announcements" },
]

const SERVICE_LINKS: { label: string; key: PublicDialogKey; icon: typeof FileText; description: string }[] = [
  { label: "Request Document", key: "request-document", icon: FileText, description: "Apply for barangay certificates and clearances online" },
  { label: "Track Request", key: "track-request", icon: Search, description: "Check the status of your submitted request" },
  { label: "Report Incident", key: "report-incident", icon: ShieldAlert, description: "File an incident report with the barangay" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-sm"
    >
      <AnnouncementTicker />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <BarangaySeal />
          <div className="leading-tight">
            <p className="font-heading text-base font-bold tracking-tight text-primary-foreground">
              e-Catarman
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-primary-foreground/70">
              Digital Barangay Operations Management System
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-white/10 hover:text-primary-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="group relative">
            <button
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-white/10 hover:text-primary-foreground"
            >
              Services
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-border bg-card p-2 shadow-xl">
                {SERVICE_LINKS.map((service) => (
                  <button
                    key={service.key}
                    type="button"
                    onClick={() => setOpenDialog(service.key)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-secondary"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <service.icon className="size-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{service.label}</span>
                      <span className="block text-xs text-muted-foreground">{service.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <a
            href="#emergency-hotlines"
            className="ml-1 inline-flex items-center gap-2 rounded-full bg-red-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400"
          >
            <ShieldAlert className="size-4" />
            Emergency Hotline
          </a>
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-primary-foreground/10 bg-primary text-primary-foreground">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-primary-foreground">
                <BarangaySeal className="size-8" />
                e-Catarman
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/85 hover:bg-white/10 hover:text-primary-foreground">
                  {link.label}
                </a>
              ))}
              <a
                href="#emergency-hotlines"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400"
              >
                <ShieldAlert className="size-4" />
                Emergency Hotline
              </a>
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-primary-foreground/60">Public Services</p>
              {SERVICE_LINKS.map((service) => (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setOpenDialog(service.key)
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-primary-foreground/85 hover:bg-white/10 hover:text-primary-foreground"
                >
                  <service.icon className="size-4 text-gold" />
                  {service.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
