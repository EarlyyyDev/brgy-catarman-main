"use client"

import * as React from "react"
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Maximize,
  MessageCircle,
  RotateCw,
  ThumbsUp,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { REACTIONS, ReactionBubble, reactionByKey } from "@/components/public/reaction-icons"
import { AnnouncementCommentPanel } from "@/components/public/announcement-comment-panel"
import { prepareAnnouncementHtml } from "@/lib/safe-html"
import { useAnnouncementEngagement } from "@/lib/hooks/use-announcement-engagement"
import { useRelativeTime } from "@/lib/hooks/use-relative-time"
import { isVideoUrl as isVideo } from "@/lib/media-url"
import { cn } from "@/lib/utils"
import type { Announcement } from "@/types"

interface AnnouncementLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement
  mediaUrls: string[]
  startIndex: number
  /** True only inside the staff/admin dashboard -- see useAnnouncementEngagement. */
  isStaffContext?: boolean
}

export function AnnouncementLightbox({ open, onOpenChange, announcement, mediaUrls, startIndex, isStaffContext = false }: AnnouncementLightboxProps) {
  const [index, setIndex] = React.useState(startIndex)
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = React.useRef<{ startX: number; startY: number; startOffX: number; startOffY: number } | null>(null)
  const touchStartX = React.useRef<number | null>(null)
  const viewerRef = React.useRef<HTMLDivElement>(null)

  const { likeCount, reaction, pickReaction, comments, totalCommentCount, addComment, viewerKey, viewerName, invalidate } =
    useAnnouncementEngagement(announcement, isStaffContext)
  const postedAgo = useRelativeTime(announcement.createdAt)

  const current = mediaUrls[index]

  React.useEffect(() => {
    if (open) setIndex(startIndex)
  }, [open, startIndex])

  React.useEffect(() => {
    setScale(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }, [index])

  const goPrev = React.useCallback(() => setIndex((i) => (i - 1 + mediaUrls.length) % mediaUrls.length), [mediaUrls.length])
  const goNext = React.useCallback(() => setIndex((i) => (i + 1) % mediaUrls.length), [mediaUrls.length])

  React.useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
      else if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, goPrev, goNext, onOpenChange])

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPickerOpen(true)
  }
  function scheduleClosePicker() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300)
  }

  function handleWheel(e: React.WheelEvent) {
    if (isVideo(current)) return
    e.preventDefault()
    setScale((s) => Math.min(4, Math.max(1, s + (e.deltaY < 0 ? 0.25 : -0.25))))
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (scale <= 1) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffX: offset.x, startOffY: offset.y }
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffset({ x: dragRef.current.startOffX + dx, y: dragRef.current.startOffY + dy })
  }
  function handlePointerUp() {
    dragRef.current = null
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (scale > 1) return
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void viewerRef.current?.requestFullscreen()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-screen w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-none bg-black/95 p-0 backdrop-blur-xl sm:h-screen sm:max-w-none"
      >
        <DialogTitle className="sr-only">{announcement.title}</DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close viewer"
          className="absolute right-3 top-3 z-30 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="size-5" />
        </button>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Media viewer */}
          <div
            ref={viewerRef}
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-black"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {mediaUrls.length > 1 ? (
              <span className="absolute left-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                {index + 1} / {mediaUrls.length}
              </span>
            ) : null}

            <div
              className="flex size-full items-center justify-center overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {isVideo(current) ? (
                <video src={current} className="max-h-full max-w-full" controls autoPlay playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current}
                  alt=""
                  draggable={false}
                  className={cn("max-h-full max-w-full select-none object-contain transition-transform duration-150", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
                  style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)` }}
                  onClick={() => scale === 1 && setScale(2)}
                />
              )}
            </div>

            {!isVideo(current) ? (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 p-1.5">
                <button type="button" onClick={() => setScale((s) => Math.max(1, s - 0.25))} aria-label="Zoom out" className="rounded-full p-2 text-white hover:bg-white/20">
                  <ZoomOut className="size-4" />
                </button>
                <button type="button" onClick={() => setScale((s) => Math.min(4, s + 0.25))} aria-label="Zoom in" className="rounded-full p-2 text-white hover:bg-white/20">
                  <ZoomIn className="size-4" />
                </button>
                <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Rotate" className="rounded-full p-2 text-white hover:bg-white/20">
                  <RotateCw className="size-4" />
                </button>
                <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className="rounded-full p-2 text-white hover:bg-white/20">
                  <Maximize className="size-4" />
                </button>
              </div>
            ) : null}

            {mediaUrls.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next"
                  className="absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}

            {mediaUrls.length > 1 ? (
              <div className="flex w-full shrink-0 items-center gap-1.5 overflow-x-auto bg-black/60 p-2">
                {mediaUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "size-14 shrink-0 overflow-hidden rounded-md border-2 transition-opacity",
                      i === index ? "border-gold opacity-100" : "border-transparent opacity-60 hover:opacity-90"
                    )}
                  >
                    {isVideo(url) ? (
                      <video src={url} className="size-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="size-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="flex max-h-[45vh] min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-white/10 bg-card lg:h-auto lg:max-h-none lg:w-[380px] lg:overflow-visible lg:border-t-0 lg:border-l">
            <div className="shrink-0 space-y-3 border-b border-border p-4">
              <div className="flex items-start gap-3">
                <BarangaySeal className="size-10 shrink-0" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    Barangay Catarman
                    <BadgeCheck className="size-4 text-gold" />
                  </p>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {announcement.author} · {postedAgo}
                  </p>
                </div>
              </div>
              <h3 className="font-heading text-base font-bold text-foreground">{announcement.title}</h3>
              <div
                className="max-h-24 overflow-y-auto text-sm leading-relaxed text-foreground/80 [&_a]:text-primary [&_a]:underline [&_a]:break-all"
                dangerouslySetInnerHTML={{ __html: prepareAnnouncementHtml(announcement.content) }}
              />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex -space-x-1.5">
                  <ReactionBubble reaction="like" className="size-5" />
                  <ReactionBubble reaction="love" className="size-5" />
                  <ReactionBubble reaction="haha" className="size-5" />
                  <span className="ml-2 self-center">{likeCount} Reactions</span>
                </div>
              </div>

              <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                <span>{totalCommentCount} comments</span>
              </div>

              <div className="grid grid-cols-2 gap-1 border-t border-border pt-2">
                <div className="relative" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
                  {pickerOpen ? (
                    <div className="absolute bottom-full left-1/2 z-30 mb-1 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-lg">
                      {REACTIONS.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => {
                            pickReaction(r.key)
                            setPickerOpen(false)
                          }}
                          aria-label={r.label}
                          className="transition-transform duration-150 hover:-translate-y-1.5 hover:scale-125"
                        >
                          <ReactionBubble reaction={r.key} className="size-8" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => pickReaction("like")}
                    className={cn(
                      "flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold hover:bg-secondary",
                      reaction ? reactionByKey(reaction).labelColor : "text-muted-foreground"
                    )}
                  >
                    {reaction ? <ReactionBubble reaction={reaction} className="size-4" /> : <ThumbsUp className="size-4" />}
                    {reaction ? reactionByKey(reaction).label : "Like"}
                  </button>
                </div>
                <button type="button" className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold text-muted-foreground hover:bg-secondary">
                  <MessageCircle className="size-4" />
                  Comment
                </button>
              </div>
            </div>

            <AnnouncementCommentPanel
              className="flex flex-col lg:min-h-0 lg:flex-1"
              comments={comments}
              viewerKey={viewerKey}
              viewerName={viewerName}
              onAddComment={addComment}
              onChanged={invalidate}
              isStaffContext={isStaffContext}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
