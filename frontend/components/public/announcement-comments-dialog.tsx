"use client"

import * as React from "react"
import { BadgeCheck, ChevronDown, Image as ImageIcon, Send, Smile, ThumbsUp, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Input } from "@/components/ui/input"
import { CommentRow } from "@/components/public/comment-row"
import { AnnouncementMediaGrid } from "@/components/public/announcement-media-grid"
import { AnnouncementAttachmentList } from "@/components/public/announcement-attachment-list"
import { AnnouncementLightbox } from "@/components/public/announcement-lightbox"
import { useMe } from "@/lib/api/hooks/use-auth"
import { useRelativeTime } from "@/lib/hooks/use-relative-time"
import { prepareAnnouncementHtml } from "@/lib/safe-html"
import type { EngagementComment } from "@/lib/api/adapters/engagement.adapter"
import type { Announcement } from "@/types"

interface AnnouncementCommentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement
  likeCount: number
  comments: EngagementComment[]
  viewerKey: string
  viewerName: string
  onAddComment: (text: string) => void
  onChanged: () => void
  /** True only inside the staff/admin dashboard -- see useAnnouncementEngagement. */
  isStaffContext?: boolean
}

export function AnnouncementCommentsDialog({
  open,
  onOpenChange,
  announcement,
  likeCount,
  comments,
  viewerKey,
  viewerName,
  onAddComment,
  onChanged,
  isStaffContext = false,
}: AnnouncementCommentsDialogProps) {
  const [draft, setDraft] = React.useState("")
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const mediaUrls = announcement.mediaUrls ?? []
  const { data: session } = useMe()
  const viewerAvatarUrl = isStaffContext ? session?.avatarUrl : undefined
  const postedAgo = useRelativeTime(announcement.createdAt)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = draft.trim()
    if (!value) return
    onAddComment(value)
    setDraft("")
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground ring-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Barangay Catarman&apos;s post</DialogTitle>

        <div className="relative flex shrink-0 items-center justify-center border-b border-border px-4 py-3">
          <p className="text-[15px] font-semibold text-foreground">Barangay Catarman&apos;s post</p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-start gap-3 p-4">
            <BarangaySeal className="size-11 shrink-0" />
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                Barangay Catarman
                <BadgeCheck className="size-4 text-gold" />
              </p>
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {announcement.author} · {postedAgo}
              </p>
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{announcement.category}</p>
            <h3 className="mt-1 font-heading text-base font-bold text-foreground">{announcement.title}</h3>
            <div
              className="mt-1.5 text-sm leading-relaxed text-foreground/80 [&_a]:text-primary [&_a]:underline [&_a]:break-all"
              dangerouslySetInnerHTML={{ __html: prepareAnnouncementHtml(announcement.content) }}
            />
            {mediaUrls.length > 0 ? <AnnouncementMediaGrid urls={mediaUrls} onMediaClick={setLightboxIndex} /> : null}
            {announcement.attachments && announcement.attachments.length > 0 ? (
              <AnnouncementAttachmentList attachments={announcement.attachments} />
            ) : null}
          </div>

          <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="size-3.5" />
              {likeCount}
            </span>
            <span>{comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)} comments</span>
          </div>

          <div className="mx-4 border-t border-border" />

          <div className="flex items-center justify-between px-4 py-2.5">
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
              Most relevant
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          <div className="space-y-3 px-4 pb-3">
            {[...comments].reverse().map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                viewerKey={viewerKey}
                viewerName={viewerName}
                isStaffContext={isStaffContext}
                onChanged={onChanged}
              />
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-border p-3">
          <InitialsAvatar name={viewerName} photoUrl={viewerAvatarUrl} size="sm" />
          <div className="relative flex-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment..."
              className="h-9 rounded-full bg-secondary pr-16"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-muted-foreground">
              <Smile className="size-4" />
              <ImageIcon className="size-4" />
            </div>
          </div>
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Post comment"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary disabled:opacity-30"
          >
            <Send className="size-4" />
          </button>
        </form>
      </DialogContent>
    </Dialog>

    {mediaUrls.length > 0 && lightboxIndex !== null ? (
      <AnnouncementLightbox
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
        announcement={announcement}
        mediaUrls={mediaUrls}
        startIndex={lightboxIndex}
        isStaffContext={isStaffContext}
      />
    ) : null}
    </>
  )
}
