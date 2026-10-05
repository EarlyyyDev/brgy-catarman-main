"use client"

import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, ChevronDown, Clock, FileText, LandPlot, MapPin, ShieldAlert, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BarangayHallIllustration } from "@/components/shared/barangay-hall-illustration"
import { Particles } from "@/components/public/sections/particles"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { usePublicStats } from "@/lib/api/hooks/use-dashboard"
import { usePublicDialogStore } from "@/lib/stores/public-dialog-store"

export function Hero() {
  const { settings } = usePublicSettings()
  const { stats } = usePublicStats()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  const glanceStats = [
    { label: "Residents", value: (stats?.residents ?? 0).toLocaleString(), icon: Users },
    { label: "Puroks", value: (stats?.puroks ?? 0).toString(), icon: MapPin },
    { label: "Land Area", value: settings.landArea, icon: LandPlot },
    { label: "Founded", value: settings.founded, icon: CalendarDays },
  ]

  return (
    <section
      id="hero"
      className="relative isolate -mt-[6.25rem] flex min-h-[92vh] items-center overflow-hidden pt-[6.25rem]"
      style={{ backgroundColor: "var(--primary)" }}
    >
      <div className="absolute inset-0">
        {settings.heroBackgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.heroBackgroundUrl} alt="" className="size-full object-cover" />
        ) : (
          <BarangayHallIllustration />
        )}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--primary) 95%, transparent) 0%, color-mix(in srgb, var(--primary) 80%, transparent) 50%, var(--primary) 100%)",
        }}
      />
      <Particles />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-gold backdrop-blur-sm"
            >
              <Clock className="size-3.5" />
              {settings.officeHours}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              Fast and <span className="text-gradient-gold">Easier</span>
              <br />
              Transactions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              e-Catarman is the online service portal of Barangay Catarman that lets residents request documents,
              track application status, and report community incidents — all from the comfort of home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
                onClick={() => setOpenDialog("request-document")}
              >
                <FileText className="size-4.5" />
                Request Documents
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold sm:w-auto"
                onClick={() => setOpenDialog("track-request")}
              >
                <Search className="size-4.5" />
                Track Status
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white sm:w-auto"
                onClick={() => setOpenDialog("report-incident")}
              >
                <ShieldAlert className="size-4.5" />
                Report an Incident
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Barangay at a Glance</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {glanceStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                    <stat.icon className="mb-2 size-5 text-gold" />
                    <p className="font-heading text-lg font-bold leading-tight text-white sm:text-2xl">{stat.value}</p>
                    <p className="text-xs font-medium text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-white/50 transition-colors hover:text-white"
      >
        <span className="text-[11px] uppercase tracking-widest">Scroll to explore</span>
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  )
}
