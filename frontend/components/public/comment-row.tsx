"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Send, ThumbsUp } from "lucide-react"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Input } from "@/components/ui/input"
import { REACTIONS, ReactionBubble, reactionByKey, type ReactionKey } from "@/components/public/reaction-icons"
import { AnnouncementReactionsDialog } from "@/components/public/announcement-reactions-dialog"
import { AuthorRoleBadge } from "@/components/public/author-role-badge"
import { announcementsApi } from "@/lib/api/endpoints"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { reactionToBackend } from "@/lib/api/adapters/engagement.adapter"
import { useMe } from "@/lib/api/hooks/use-auth"
import { useRelativeTime } from "@/lib/hooks/use-relative-time"
import { cn } from "@/lib/utils"
import type { EngagementComment } from "@/lib/api/adapters/engagement.adapter"

interface CommentRowProps {
  comment: EngagementComment
  viewerKey: string
  viewerName: string
  isStaffContext?: boolean
  onChanged: () => void
}

export function CommentRow({ comment, viewerKey, viewerName, isStaffContext = false, onChanged }: CommentRowProps) {
  const { data: session } = useMe()
  // Anonymous authors are matched by the anonymous viewerKey; authenticated
  // staff authors never get a viewerKey on their comment (only real users
  // do), so they're matched by their real account id instead.
  const isYou = isStaffContext
    ? Boolean(session && comment.authorId === session.id)
    : comment.viewerKey !== undefined && comment.viewerKey === viewerKey

  const [pickerOpen, setPickerOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [replyOpen, setReplyOpen] = React.useState(false)
  const [replyDraft, setReplyDraft] = React.useState("")
  const [reactorsOpen, setReactorsOpen] = React.useState(false)
  const [repliesVisible, setRepliesVisible] = React.useState(false)
  const postedAgo = useRelativeTime(comment.createdAt)

  const setReactionMutation = useApiMutation<unknown, { reaction: string | null }>({
    mutationFn: ({ reaction }) =>
      isStaffContext
        ? announcementsApi.setCommentReaction(comment.id, { reaction })
        : announcementsApi.setCommentReactionPublic(comment.id, { reaction, viewerKey }),
    showErrorToast: false,
    onSuccess: onChanged,
  })

  const addReplyMutation = useApiMutation<unknown, { text: string }>({
    mutationFn: ({ text }) =>
      isStaffContext
        ? announcementsApi.addReply(comment.id, { text })
        : announcementsApi.addReplyPublic(comment.id, { text, authorName: viewerName, viewerKey }),
    showErrorToast: false,
    onSuccess: onChanged,
  })

  function pickReaction(key: ReactionKey) {
    setReactionMutation.mutate({ reaction: comment.myReaction === key ? null : reactionToBackend(key) })
    setPickerOpen(false)
  }

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPickerOpen(true)
  }

  function scheduleClosePicker() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300)
  }

  function submitReply(e: React.FormEvent) {
    e.preventDefault()
    const value = replyDraft.trim()
    if (!value) return
    addReplyMutation.mutate({ text: value }, { onSuccess: () => setReplyDraft("") })
  }

  return (
    <div className="flex items-start gap-2">
      <InitialsAvatar name={comment.authorName} photoUrl={comment.authorAvatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="inline-block rounded-2xl bg-secondary px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {comment.authorName}
            {comment.authorRole ? <AuthorRoleBadge role={comment.authorRole} /> : null}
            {isYou && comment.authorRole ? <span className="font-normal text-muted-foreground">(You)</span> : null}
          </p>
          <p className="text-sm text-foreground/90">{comment.text}</p>
        </div>
        <div className="mt-1 ml-3 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <div className="relative" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
            {pickerOpen ? (
              <div className="absolute bottom-full left-0 z-20 mb-1 flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-lg">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => pickReaction(r.key)}
                    aria-label={r.label}
                    className="transition-transform duration-150 hover:-translate-y-1 hover:scale-125"
                  >
                    <ReactionBubble reaction={r.key} className="size-7" />
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => pickReaction("like")}
              className={cn("font-semibold hover:underline", comment.myReaction ? reactionByKey(comment.myReaction).labelColor : undefined)}
            >
              {comment.myReaction ? reactionByKey(comment.myReaction).label : "Like"}
            </button>
          </div>
          <button type="button" onClick={() => setReplyOpen((v) => !v)} className="hover:underline">
            Reply
          </button>
          <span suppressHydrationWarning>{postedAgo}</span>
          {comment.reactionCount > 0 ? (
            <button
              type="button"
              onClick={() => setReactorsOpen(true)}
              className="flex items-center gap-1 text-muted-foreground hover:underline"
            >
              {comment.myReaction ? (
                <ReactionBubble reaction={comment.myReaction} className="size-3.5" />
              ) : (
                <span className="flex size-3.5 items-center justify-center rounded-full bg-primary text-white">
                  <ThumbsUp className="size-2 fill-white" />
                </span>
              )}
              {comment.reactionCount}
            </button>
          ) : null}
        </div>

        {comment.replies.length > 0 ? (
          <div className="mt-1 ml-3">
            <button
              type="button"
              onClick={() => setRepliesVisible((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:underline"
            >
              {repliesVisible ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {repliesVisible ? "Hide" : "View"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>

            {repliesVisible ? (
              <div className="mt-2 space-y-2">
                {comment.replies.map((r) => {
                  const isReplyYou = isStaffContext
                    ? Boolean(session && r.authorId === session.id)
                    : r.viewerKey !== undefined && r.viewerKey === viewerKey
                  return (
                    <div key={r.id} className="flex items-start gap-2">
                      <InitialsAvatar name={r.name} photoUrl={r.avatarUrl} size="sm" />
                      <div className="inline-block rounded-2xl bg-secondary px-3 py-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          {r.name}
                          {r.role ? <AuthorRoleBadge role={r.role} /> : null}
                          {isReplyYou && r.role ? <span className="font-normal text-muted-foreground">(You)</span> : null}
                        </p>
                        <p className="text-sm text-foreground/90">{r.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {replyOpen ? (
          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
            <InitialsAvatar name={viewerName} size="sm" />
            <Input
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder={`Reply to ${comment.authorName}...`}
              className="h-8 flex-1 rounded-full bg-secondary text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyDraft.trim()}
              aria-label="Post reply"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary disabled:opacity-30"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        ) : null}
      </div>

      <AnnouncementReactionsDialog
        open={reactorsOpen}
        onOpenChange={setReactorsOpen}
        reactionCount={comment.reactionCount}
        userReaction={comment.myReaction}
      />
    </div>
  )
}
