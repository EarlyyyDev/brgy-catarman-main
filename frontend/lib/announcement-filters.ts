import type { Announcement, AnnouncementCategory } from "@/types"

export type AnnouncementSort = "newest" | "oldest" | "pinned"
export type AnnouncementMediaFilter = "all" | "photos" | "videos"

export interface AnnouncementFilterState {
  query: string
  sort: AnnouncementSort
  category: AnnouncementCategory | "all"
  media: AnnouncementMediaFilter
}

export const DEFAULT_ANNOUNCEMENT_FILTERS: AnnouncementFilterState = {
  query: "",
  sort: "pinned",
  category: "all",
  media: "all",
}

// publishAt is date-only precision (the "Publish Date" picker has no time
// component, so same-day posts share an identical midnight timestamp) --
// createdAt as a tiebreaker ensures the most recently created post of the
// day actually sorts first, matching the backend's own ordering.
export function compareByPublishThenCreated(a: Announcement, b: Announcement): number {
  const publishDiff = new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
  if (publishDiff !== 0) return publishDiff
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function hasVideo(a: Announcement) {
  return (a.mediaUrls ?? []).some((url) => url.startsWith("data:video/"))
}

function hasPhoto(a: Announcement) {
  return (a.mediaUrls ?? []).some((url) => !url.startsWith("data:video/"))
}

export function filterAnnouncements(items: Announcement[], filters: AnnouncementFilterState): Announcement[] {
  const query = filters.query.trim().toLowerCase()

  let result = items.filter((a) => {
    if (query && !a.title.toLowerCase().includes(query) && !a.excerpt.toLowerCase().includes(query)) return false
    if (filters.category !== "all" && a.category !== filters.category) return false
    if (filters.media === "photos" && !hasPhoto(a)) return false
    if (filters.media === "videos" && !hasVideo(a)) return false
    return true
  })

  result = [...result].sort((a, b) => {
    if (filters.sort === "pinned") {
      const pinDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
      if (pinDiff !== 0) return pinDiff
      return compareByPublishThenCreated(a, b)
    }
    const diff = compareByPublishThenCreated(a, b)
    return filters.sort === "oldest" ? -diff : diff
  })

  return result
}
