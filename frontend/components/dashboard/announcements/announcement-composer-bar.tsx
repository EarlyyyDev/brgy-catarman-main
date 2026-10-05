import { ImagePlus, Smile } from "lucide-react"
import { InitialsAvatar } from "@/components/shared/initials-avatar"

export function AnnouncementComposerBar({
  name,
  avatarUrl,
  onClick,
  onClickMedia,
}: {
  name: string
  avatarUrl?: string
  onClick: () => void
  onClickMedia: () => void
}) {
  const firstName = name.split(" ")[0]

  return (
    <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <InitialsAvatar name={name} photoUrl={avatarUrl} size="md" />
      <button
        type="button"
        onClick={onClick}
        className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-secondary/70"
      >
        What&apos;s on your mind, {firstName}?
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onClickMedia}
          aria-label="Add photos or videos"
          className="rounded-full p-2 text-emerald-500 hover:bg-secondary"
        >
          <ImagePlus className="size-5" />
        </button>
        <button
          type="button"
          onClick={onClick}
          aria-label="Create announcement"
          className="rounded-full p-2 text-amber-500 hover:bg-secondary"
        >
          <Smile className="size-5" />
        </button>
      </div>
    </div>
  )
}
