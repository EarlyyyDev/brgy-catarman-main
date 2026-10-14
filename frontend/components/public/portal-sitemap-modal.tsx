"use client"

import Link from "next/link"
import { ArrowUpRight, Building2, FileText, MapPinned, Megaphone, ShieldAlert, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const PORTAL_SECTIONS = [
  {
    title: "Institutional",
    items: [
      { label: "Home", href: "/" },
      { label: "About e-Catarman", href: "/#about" },
      { label: "Barangay Information", href: "/#about" },
      { label: "Barangay Officials", href: "/#officials" },
    ],
  },
  {
    title: "Services & Community",
    items: [
      { label: "Request Document", href: "/request-document" },
      { label: "Track Document Request", href: "/track-request" },
      { label: "Report Incident", href: "/report-incident" },
      { label: "Announcements", href: "/announcements" },
      { label: "Contact Information", href: "/#contact" },
    ],
  },
]

const sectionIcons = [Building2, MapPinned, FileText, Megaphone, ShieldAlert] as const

export function PortalSitemapModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(1100px,calc(100%-1.5rem))] overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0 shadow-2xl sm:p-0">
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E3A8A] to-[#17377a] px-5 py-5 text-white sm:px-7 sm:py-6">
          <DialogHeader className="gap-2 text-left">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                <Sparkles className="size-3.5" />
                Portal Directory
              </div>
            </div>
            <DialogTitle className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              PORTAL SITEMAP
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-200 sm:text-base">
              Explore the e-Catarman Portal.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          {PORTAL_SECTIONS.map((section, index) => {
            const Icon = sectionIcons[index % sectionIcons.length]

            return (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2.5 border-b border-slate-200 pb-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-slate-900">{section.title}</h3>
                </div>

                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#10B981]/50 hover:bg-emerald-50 hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="size-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#10B981]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
