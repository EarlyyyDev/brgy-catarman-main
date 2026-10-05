"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ClipboardList, Eye, Flag, Target } from "lucide-react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export function MissionVisionGoals() {
  const { settings: systemSettings } = usePublicSettings()

  const CARDS = [
    {
      key: "mission",
      title: "Mission",
      icon: Flag,
      body: systemSettings.missionStatement,
    },
    {
      key: "vision",
      title: "Vision",
      icon: Eye,
      body: systemSettings.visionStatement,
    },
    {
      key: "goals",
      title: "Goals",
      icon: Target,
      items: systemSettings.goals,
    },
    {
      key: "objectives",
      title: "Objectives",
      icon: ClipboardList,
      items: systemSettings.objectives,
    },
  ] as const

  return (
    <section id="mission-vision" className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Our Foundation</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
            Mission, Vision, Goals &amp; Objectives
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Discover the guiding principles that shape the leadership, public service, and long-term development of
            Barangay Catarman.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((card, idx) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group flex h-full flex-col items-start rounded-2xl border border-border bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-primary transition-colors duration-300 group-hover:bg-gold/15">
                <card.icon className="size-6" strokeWidth={1.75} />
              </span>

              <h3 className="mt-5 text-xl font-bold text-primary">{card.title}</h3>

              {"body" in card ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                      <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
