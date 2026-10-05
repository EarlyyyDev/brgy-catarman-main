"use client"

import * as React from "react"
import { BadgeCheck, Eye, Globe, MessageCircle, MoreHorizontal, Pencil, Pin, PinOff, ThumbsUp, Trash2 } from "lucide-react"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { StatusBadge } from "@/components/shared/status-badge"
import { REACTIONS, ReactionBubble, reactionByKey, type ReactionKey } from "@/components/public/reaction-icons"
import { AnnouncementCommentsDialog } from "@/components/public/announcement-comments-dialog"
import { AnnouncementReactionsDialog } from "@/components/public/announcement-reactions-dialog"
import { AnnouncementMediaGrid } from "@/components/public/announcement-media-grid"
import { AnnouncementLightbox } from "@/components/public/announcement-lightbox"
import { AnnouncementAttachmentList } from "@/components/public/announcement-attachment-list"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { prepareAnnouncementHtml } from "@/lib/safe-html"
import { useAnnouncementEngagement } from "@/lib/hooks/use-announcement-engagement"
import { useRelativeTime } from "@/lib/hooks/use-relative-time"
import type { Announcement } from "@/types"

interface AdminActions {
  onPreview: () => void
  onEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
}

export function AnnouncementPostCard({
  announcement,
  adminActions,
  isStaffContext = false,
}: {
  announcement: Announcement
  adminActions?: AdminActions
  /** True only inside the staff/admin dashboard -- see useAnnouncementEngagement. */
  isStaffContext?: boolean
}) {
  const [commentsOpen, setCommentsOpen] = React.useState(false)
  const [reactionsOpen, setReactionsOpen] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const { likeCount, topReactions, reaction, pickReaction: pickReactionRaw, comments, totalCommentCount, addComment, viewerKey, viewerName, invalidate } =
    useAnnouncementEngagement(announcement, isStaffContext)
  const postedAgo = useRelativeTime(announcement.createdAt)

  const isLong = announcement.content.length > announcement.excerpt.length + 20
  const mediaUrls = announcement.mediaUrls ?? []

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPickerOpen(true)
  }

  function scheduleClosePicker() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300)
  }

  function pickReaction(key: ReactionKey) {
    pickReactionRaw(key)
    setPickerOpen(false)
  }

  return (
    <article id={announcement.id} className="scroll-mt-24 rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <div className="flex items-start gap-3">
          <BarangaySeal className="size-11 shrink-0" />
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
              Barangay Catarman
              <BadgeCheck className="size-4 text-gold" />
            </p>
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <span>{announcement.author}</span>
              <span aria-hidden="true">·</span>
              <span suppressHydrationWarning>{postedAgo}</span>
              <Globe className="ml-0.5 size-3" />
              {announcement.isPinned ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5 font-medium text-gold">
                    <Pin className="size-3" />
                    Pinned
                  </span>
                </>
              )
              : null}
            </p>
          </div>
        </div>
        {adminActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="More options">
                <MoreHorizontal className="size-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={adminActions.onPreview}>
                <Eye className="size-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={adminActions.onEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={adminActions.onTogglePin}>
                {announcement.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                {announcement.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={adminActions.onDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="More options">
            <MoreHorizontal className="size-4.5" />
          </button>
        )}
      </div>

      <div className="px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {adminActions ? <StatusBadge status={announcement.status} /> : null}
          <Badge variant="outline">{announcement.category}</Badge>
        </div>
        <h3 className="mt-2 break-words font-heading text-base font-bold text-foreground">{announcement.title}</h3>
        <div
          className="mt-1.5 line-clamp-3 break-words text-sm leading-relaxed text-foreground/80 [&_a]:text-primary [&_a]:underline [&_a]:break-all"
          dangerouslySetInnerHTML={{ __html: prepareAnnouncementHtml(announcement.content) }}
        />
        {isLong ? (
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="mt-1 text-sm font-semibold text-muted-foreground hover:text-primary hover:underline"
          >
            See more
          </button>
        ) : null}

        {mediaUrls.length > 0 ? <AnnouncementMediaGrid urls={mediaUrls} onMediaClick={setLightboxIndex} /> : null}

        {announcement.attachments && announcement.attachments.length > 0 ? (
          <AnnouncementAttachmentList attachments={announcement.attachments} />
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between px-4 pb-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            {reaction ? <ReactionBubble reaction={reaction} className="size-4" /> : <ThumbsUp className="size-4" />}
            {likeCount}
          </span>
          <button type="button" onClick={() => setCommentsOpen(true)} className="hover:underline">
            {totalCommentCount} comments
          </button>
        </div>

        {likeCount > 0 ? (
          <button
            type="button"
            onClick={() => setReactionsOpen(true)}
            className="flex -space-x-1.5 hover:opacity-80"
            aria-label="See who reacted"
          >
            {topReactions.slice(0, 3).map((key) => (
              <ReactionBubble key={key} reaction={key} className="size-5" />
            ))}
          </button>
        ) : null}
      </div>

      <div className="mx-4 border-t border-border" />

      <div className="grid grid-cols-2 gap-1 p-2">
        <div className="relative" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
          {pickerOpen ? (
            <div className="absolute bottom-full left-1/2 z-20 mb-1 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-lg">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => pickReaction(r.key)}
                  aria-label={r.label}
                  className="transition-transform duration-150 hover:-translate-y-1.5 hover:scale-125"
                >
                  <ReactionBubble reaction={r.key} className="size-9" />
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => pickReaction("like")}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors hover:bg-secondary",
              reaction ? reactionByKey(reaction).labelColor : "text-muted-foreground"
            )}
          >
            {reaction ? <ReactionBubble reaction={reaction} className="size-4" /> : <ThumbsUp className="size-4" />}
            {reaction ? reactionByKey(reaction).label : "Like"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
        >
          <MessageCircle className="size-4" />
          Comment
        </button>
      </div>

      <AnnouncementCommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        announcement={announcement}
        likeCount={likeCount}
        comments={comments}
        viewerKey={viewerKey}
        viewerName={viewerName}
        onAddComment={addComment}
        onChanged={invalidate}
        isStaffContext={isStaffContext}
      />

      <AnnouncementReactionsDialog
        open={reactionsOpen}
        onOpenChange={setReactionsOpen}
        reactionCount={likeCount}
        userReaction={reaction}
      />

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
    </article>
  )
}
