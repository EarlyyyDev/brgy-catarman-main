export function AnnouncementSkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="size-11 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3.5 w-40 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
      <div className="mt-4 h-48 w-full rounded-xl bg-muted" />
      <div className="mt-4 flex items-center gap-4">
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}
