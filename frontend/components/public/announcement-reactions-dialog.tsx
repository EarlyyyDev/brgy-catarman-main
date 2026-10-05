"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ReactionBubble, type ReactionKey } from "@/components/public/reaction-icons"

interface AnnouncementReactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reactionCount: number
  userReaction: ReactionKey | null
}

/** The backend only exposes aggregate per-type counts, not individual
 * reactor identities (most reactions are anonymous, so there's no name to
 * show) — this lists generic entries for the real count, with the current
 * viewer's own reaction distinguished as "(You)" when present. */
export function AnnouncementReactionsDialog({ open, onOpenChange, reactionCount, userReaction }: AnnouncementReactionsDialogProps) {
  const entries = React.useMemo(() => {
    const count = Math.max(reactionCount, userReaction ? 1 : 0)
    return Array.from({ length: count }, (_, i) => ({
      isYou: userReaction !== null && i === 0,
      reaction: i === 0 && userReaction ? userReaction : ("like" as ReactionKey),
    }))
  }, [reactionCount, userReaction])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[80vh] w-full max-w-sm flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground ring-0"
      >
        <DialogTitle className="sr-only">Reactions</DialogTitle>

        <div className="relative flex shrink-0 items-center gap-1 border-b border-border px-4 py-3">
          <p className="rounded-md px-2 py-1.5 text-sm font-semibold text-primary">
            All <span className="text-xs">{entries.length}</span>
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {entries.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary">
              <div className="relative">
                <InitialsAvatar name={r.isYou ? "You" : "Resident"} size="md" />
                <ReactionBubble reaction={r.reaction} className="absolute -bottom-1 -right-1 size-4 ring-2 ring-card" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {r.isYou ? "You" : "Resident"}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
