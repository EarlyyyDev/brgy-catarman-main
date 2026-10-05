import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnnouncementFilterState, AnnouncementMediaFilter, AnnouncementSort } from "@/lib/announcement-filters"
import type { AnnouncementCategory } from "@/types"

const CATEGORIES: AnnouncementCategory[] = ["General", "Health", "Safety", "Event", "Advisory", "Job Opening"]

export function AnnouncementSearchBar({
  filters,
  onChange,
}: {
  filters: AnnouncementFilterState
  onChange: (next: AnnouncementFilterState) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search announcements..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={filters.sort} onValueChange={(v) => onChange({ ...filters, sort: v as AnnouncementSort })}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pinned">Pinned First</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.media} onValueChange={(v) => onChange({ ...filters, media: v as AnnouncementMediaFilter })}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Media</SelectItem>
            <SelectItem value="photos">With Photos</SelectItem>
            <SelectItem value="videos">With Videos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ ...filters, category: v as AnnouncementCategory | "all" })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
