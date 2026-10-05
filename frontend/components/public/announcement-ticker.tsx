"use client"

import { Megaphone, Phone } from "lucide-react"
import { usePublishedAnnouncements } from "@/lib/api/hooks/use-announcements"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { compareByPublishThenCreated } from "@/lib/announcement-filters"

export function AnnouncementTicker() {
  const { announcements } = usePublishedAnnouncements({ pageSize: 100 })
  const { settings } = usePublicSettings()
  const contactNumber = settings.contactNumbers[0]
  const latest = announcements
    .filter((a) => a.status === "Published")
    .sort(compareByPublishThenCreated)
    .slice(0, 4)
    .map((a) => a.title)

  const feed = latest.length > 0 ? latest : ["Welcome to the e-Catarman online service portal."]

  return (
    <div
      className="flex h-9 items-center justify-between gap-4 px-4 text-white sm:px-6 lg:px-8"
      style={{ backgroundColor: "color-mix(in srgb, var(--primary) 85%, black)" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
          <Megaphone className="size-3.5" />
          Latest
        </span>
        <div className="relative h-9 min-w-0 flex-1 overflow-hidden">
          <div className="absolute inset-y-0 flex w-max animate-marquee items-center gap-10 whitespace-nowrap text-xs text-white/75">
            {feed.map((title, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="size-1 shrink-0 rounded-full bg-gold/60" />
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
      {contactNumber ? (
        <a
          href={`tel:${contactNumber.replace(/[^0-9+]/g, "")}`}
          className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white sm:flex"
        >
          <Phone className="size-3.5" />
          {contactNumber}
        </a>
      ) : null}
    </div>
  )
}
