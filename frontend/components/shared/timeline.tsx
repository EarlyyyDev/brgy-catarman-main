import { Check } from "lucide-react"
import type { TimelineEvent } from "@/types"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn("space-y-0", className)}>
      {events.map((event, idx) => (
        <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
          {idx < events.length - 1 ? <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border" /> : null}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" />
          </span>
          <div className="pt-1">
            <p className="text-sm font-semibold text-foreground">{event.label}</p>
            {event.description ? <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p> : null}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(event.timestamp)}
              {event.actor ? ` · ${event.actor}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
