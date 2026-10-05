"use client"

import * as React from "react"
import { Megaphone } from "lucide-react"
import { AnnouncementPostCard } from "@/components/public/announcement-post-card"
import { AnnouncementSearchBar } from "@/components/public/announcement-search-bar"
import { AnnouncementSkeletonCard } from "@/components/public/announcement-skeleton-card"
import { EmptyState } from "@/components/shared/empty-state"
import { usePublishedAnnouncements } from "@/lib/api/hooks/use-announcements"
import { filterAnnouncements, DEFAULT_ANNOUNCEMENT_FILTERS, type AnnouncementFilterState } from "@/lib/announcement-filters"
import { useInfiniteList } from "@/lib/hooks/use-infinite-list"

export default function AnnouncementsPage() {
  const { announcements } = usePublishedAnnouncements({ pageSize: 100 })
  const [filters, setFilters] = React.useState<AnnouncementFilterState>(DEFAULT_ANNOUNCEMENT_FILTERS)

  const published = React.useMemo(() => announcements.filter((a) => a.status === "Published"), [announcements])
  const filtered = React.useMemo(() => filterAnnouncements(published, filters), [published, filters])
  const { visibleItems, hasMore, loading, sentinelRef } = useInfiniteList(filtered, 5)

  return (
    <div className="mx-auto max-w-[850px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Megaphone className="size-5 text-primary" />
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Community Bulletin</p>
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">All Announcements</h1>
        <p className="mt-3 text-muted-foreground">
          Stay updated with the latest news, advisories, and events from Barangay Catarman.
        </p>
      </div>

      <div className="mt-8">
        <AnnouncementSearchBar filters={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState icon={Megaphone} title="No announcements found" description="Try adjusting your search or filters." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleItems.map((a) => (
            <AnnouncementPostCard key={a.id} announcement={a} />
          ))}
          {loading ? <AnnouncementSkeletonCard /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-1" /> : null}
        </div>
      )}
    </div>
  )
}
