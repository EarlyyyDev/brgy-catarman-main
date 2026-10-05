import { Wrench } from "lucide-react"
import { BarangaySeal } from "@/components/shared/barangay-seal"

export function MaintenanceScreen({ barangayName, message }: { barangayName: string; message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-primary to-primary/90 px-4 text-center text-white">
      <BarangaySeal className="size-20" />
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
        <Wrench className="size-3.5" />
        Under Maintenance
      </div>
      <h1 className="font-heading text-3xl font-bold sm:text-4xl">{barangayName} is temporarily unavailable</h1>
      <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
        {message || "We're performing scheduled maintenance to improve our services. Please check back shortly. We apologize for the inconvenience."}
      </p>
    </div>
  )
}
