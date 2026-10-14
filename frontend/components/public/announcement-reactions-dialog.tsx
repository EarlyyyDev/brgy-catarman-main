"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ReactionBubble, reactionByKey, type ReactionKey } from "@/components/public/reaction-icons"

interface AnnouncementReactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reactionCounts: Record<string, number>
  userReaction: ReactionKey | null
}

export function AnnouncementReactionsDialog({ open, onOpenChange, reactionCounts, userReaction }: AnnouncementReactionsDialogProps) {
  const entries = React.useMemo(() => {
    const mapped = Object.entries(reactionCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const reaction = reactionByKey((key.toLowerCase() as ReactionKey) || "like")
        return {
          reaction: reaction.key,
          count,
          isYou: userReaction !== null && reaction.key === userReaction,
        }
      })

    if (userReaction && !mapped.some((entry) => entry.reaction === userReaction)) {
      mapped.unshift({
        reaction: userReaction,
        count: 1,
        isYou: true,
      })
    }

    return mapped
  }, [reactionCounts, userReaction])

  const totalReactions = entries.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[80vh] w-full max-w-sm flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground ring-0"
      >
        <DialogTitle className="sr-only">Reactions</DialogTitle>

        <div className="relative flex shrink-0 items-center gap-1 border-b border-border px-4 py-3">
          <p className="rounded-md px-2 py-1.5 text-sm font-semibold text-primary">
            All <span className="text-xs">{totalReactions}</span>
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
          {entries.map((entry, index) => (
            <div key={`${entry.reaction}-${index}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-secondary">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <InitialsAvatar name={entry.isYou ? "You" : "Resident"} size="md" />
                  <ReactionBubble reaction={entry.reaction} className="absolute -bottom-1 -right-1 size-4 ring-2 ring-card" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.isYou ? "You" : "Resident"}
                  </p>
                  <p className="text-xs text-muted-foreground">{reactionByKey(entry.reaction).label}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{entry.count}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
