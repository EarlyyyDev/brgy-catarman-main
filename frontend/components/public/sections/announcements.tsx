"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Megaphone, Pin } from "lucide-react"
import { usePublishedAnnouncements } from "@/lib/api/hooks/use-announcements"
import { compareByPublishThenCreated } from "@/lib/announcement-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { isVideoUrl } from "@/lib/media-url"

const MAX_THUMBNAILS = 4
const URL_PATTERN = /(https?:\/\/[^\s<]+)/g

/** excerpt is plain text (HTML already stripped server-side), so bare URLs
 * in it are never real <a> tags -- wraps them as clickable links without
 * ever treating the text as HTML (no dangerouslySetInnerHTML, no escaping
 * concerns), unlike the full post view's rich-text content field. */
function linkifyText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  URL_PATTERN.lastIndex = 0
  while ((match = URL_PATTERN.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <a
        key={match.index}
        href={match[0]}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-primary underline"
      >
        {match[0]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function AnnouncementThumbnailGrid({ urls }: { urls: string[] }) {
  const shown = urls.slice(0, MAX_THUMBNAILS)
  const remaining = urls.length - shown.length

  return (
    <div className={`mt-4 grid gap-1.5 ${shown.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {shown.map((url, i) => {
        const isLastTile = i === shown.length - 1
        return (
          <div key={i} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            {isVideoUrl(url) ? (
              <video src={url} className="size-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" loading="lazy" className="size-full object-cover" />
            )}
            {isLastTile && remaining > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{remaining}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function AnnouncementsSection() {
  const { announcements } = usePublishedAnnouncements({ pageSize: 100 })
  const topAnnouncements = [...announcements]
    .filter((a) => a.status === "Published")
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || compareByPublishThenCreated(a, b))
    .slice(0, 3)

  return (
    <section id="announcements" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Latest Announcements</p>
          </div>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Community Bulletin</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {topAnnouncements.map((a) => (
            <Card key={a.id} className="h-full overflow-hidden border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {a.isPinned ? (
                    <Badge className="gap-1 bg-gold text-gold-foreground hover:bg-gold">
                      <Pin className="size-3" />
                      Pinned
                    </Badge>
                  ) : null}
                  <Badge variant="outline">{a.category}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(a.publishAt)}</span>
                </div>
                <h3 className="mt-3 break-words font-heading text-lg font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 break-words text-sm leading-relaxed text-muted-foreground">{linkifyText(a.excerpt)}</p>
                {a.mediaUrls && a.mediaUrls.length > 0 ? <AnnouncementThumbnailGrid urls={a.mediaUrls} /> : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/announcements">
              View More
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
