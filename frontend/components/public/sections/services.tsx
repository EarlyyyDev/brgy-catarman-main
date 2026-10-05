"use client"

import { motion } from "framer-motion"
import { ArrowRight, FileText, Search, ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { usePublicDialogStore, type PublicDialogKey } from "@/lib/stores/public-dialog-store"

const SERVICES: { title: string; description: string; key: PublicDialogKey; icon: typeof FileText }[] = [
  {
    title: "Request a Document",
    description: "Apply online for a Barangay Certificate, Clearance, Certificate of Residency, Indigency, or Business Clearance — no account required.",
    key: "request-document",
    icon: FileText,
  },
  {
    title: "Track My Request",
    description: "Enter your reference number to check the real-time status of your document request, from submission to claiming.",
    key: "track-request",
    icon: Search,
  },
  {
    title: "Report an Incident",
    description: "File a confidential incident report for noise complaints, disturbances, illegal dumping, and other community concerns.",
    key: "report-incident",
    icon: ShieldAlert,
  },
]

export function Services() {
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Online Services</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Government Services, Simplified</h2>
        <p className="mt-4 text-muted-foreground">
          No lines, no hassle. Access essential barangay services online, available anytime, anywhere.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {SERVICES.map((service, idx) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <button type="button" className="block w-full text-left" onClick={() => setOpenDialog(service.key)}>
              <Card className="group h-full border-border/70 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <CardContent className="flex h-full flex-col p-7">
                  <span className="flex size-13 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <service.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Get Started
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
