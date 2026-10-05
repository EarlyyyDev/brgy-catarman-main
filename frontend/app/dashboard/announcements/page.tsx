"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Megaphone } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnnouncementFormDialog } from "@/components/dashboard/announcements/announcement-form-dialog"
import { AnnouncementComposerBar } from "@/components/dashboard/announcements/announcement-composer-bar"
import { AnnouncementPostCard } from "@/components/public/announcement-post-card"
import { AnnouncementSearchBar } from "@/components/public/announcement-search-bar"
import { AnnouncementSkeletonCard } from "@/components/public/announcement-skeleton-card"
import { useAllAnnouncements, useDeleteAnnouncement, useToggleAnnouncementPin } from "@/lib/api/hooks/use-announcements"
import { useMe } from "@/lib/api/hooks/use-auth"
import { filterAnnouncements, DEFAULT_ANNOUNCEMENT_FILTERS, type AnnouncementFilterState } from "@/lib/announcement-filters"
import { useInfiniteList } from "@/lib/hooks/use-infinite-list"
import type { Announcement } from "@/types"

export default function AnnouncementsPage() {
  const { announcements } = useAllAnnouncements()
  const deleteAnnouncement = useDeleteAnnouncement()
  const togglePin = useToggleAnnouncementPin()
  const { data: session } = useMe()

  const [formOpen, setFormOpen] = React.useState(false)
  const [autoOpenMedia, setAutoOpenMedia] = React.useState(false)
  const [editing, setEditing] = React.useState<Announcement | undefined>()
  const [previewing, setPreviewing] = React.useState<Announcement | undefined>()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<AnnouncementFilterState>(DEFAULT_ANNOUNCEMENT_FILTERS)

  const filtered = React.useMemo(() => filterAnnouncements(announcements, filters), [announcements, filters])
  const { visibleItems, hasMore, loading, sentinelRef } = useInfiniteList(filtered, 6)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Manage community announcements. Only the top 3 published items appear on the landing page."
      />

      <div className="mx-auto max-w-[850px] space-y-4">
        <AnnouncementComposerBar
          name={session?.name ?? "Staff"}
          avatarUrl={session?.avatarUrl}
          onClick={() => { setEditing(undefined); setAutoOpenMedia(false); setFormOpen(true) }}
          onClickMedia={() => { setEditing(undefined); setAutoOpenMedia(true); setFormOpen(true) }}
        />

        <AnnouncementSearchBar filters={filters} onChange={setFilters} />

        {filtered.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements found" description="Try adjusting your search or filters, or create a new announcement." />
        ) : (
          <div className="space-y-4">
            {visibleItems.map((a) => (
              <AnnouncementPostCard
                key={a.id}
                announcement={a}
                isStaffContext
                adminActions={{
                  onPreview: () => setPreviewing(a),
                  onEdit: () => { setEditing(a); setAutoOpenMedia(false); setFormOpen(true) },
                  onTogglePin: () => {
                    togglePin.mutate(a.id, {
                      onSuccess: () => toast.success(a.isPinned ? "Announcement unpinned." : "Announcement pinned to top."),
                    })
                  },
                  onDelete: () => setDeletingId(a.id),
                }}
              />
            ))}
            {loading ? <AnnouncementSkeletonCard /> : null}
            {hasMore ? <div ref={sentinelRef} className="h-1" /> : null}
          </div>
        )}
      </div>

      <AnnouncementFormDialog open={formOpen} onOpenChange={setFormOpen} announcement={editing} autoOpenMedia={autoOpenMedia} />

      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(undefined)}>
        <DialogContent className="max-h-[85vh] sm:max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewing?.title}</DialogTitle>
          </DialogHeader>
          {previewing?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewing.imageUrl} alt="" className="max-h-64 w-full rounded-lg object-cover" />
          ) : null}
          <div className="prose prose-sm max-w-none text-sm text-foreground" dangerouslySetInnerHTML={{ __html: previewing?.content ?? "" }} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Announcement"
        description="This will permanently remove this announcement."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteAnnouncement.mutate(deletingId)
        }}
      />
    </div>
  )
}
