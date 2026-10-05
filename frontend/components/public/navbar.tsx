"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Menu, Search, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { AnnouncementTicker } from "@/components/public/announcement-ticker"
import { usePublicDialogStore, type PublicDialogKey } from "@/lib/stores/public-dialog-store"
import { cn } from "@/lib/utils"

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
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full border-b transition-colors",
        scrolled || pathname !== "/"
          ? "border-border/60 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70"
          : "border-transparent bg-transparent"
      )}
    >
      <AnnouncementTicker />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <BarangaySeal />
          <div className="leading-tight">
            <p className={cn("font-heading text-base font-bold tracking-tight", scrolled || pathname !== "/" ? "text-foreground" : "text-white")}>
              e-Catarman
            </p>
            <p className={cn("text-[11px] font-medium uppercase tracking-widest", scrolled || pathname !== "/" ? "text-muted-foreground" : "text-white/70")}>
              Digital Barangay Operations Management System
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                scrolled || pathname !== "/" ? "text-foreground/80 hover:bg-secondary hover:text-foreground" : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
          <div className="group relative">
            <button
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                scrolled || pathname !== "/" ? "text-foreground/80 hover:bg-secondary hover:text-foreground" : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
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
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("lg:hidden", !scrolled && pathname === "/" && "text-white hover:bg-white/10 hover:text-white")}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BarangaySeal className="size-8" />
                e-Catarman
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                  {link.label}
                </a>
              ))}
              <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public Services</p>
              {SERVICE_LINKS.map((service) => (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setOpenDialog(service.key)
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary"
                >
                  <service.icon className="size-4 text-primary" />
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
