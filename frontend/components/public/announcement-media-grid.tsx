import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { isVideoUrl as isVideo } from "@/lib/media-url"

function MediaTile({ url, onClick, className }: { url: string; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative block size-full overflow-hidden focus:outline-none", className)}
    >
      {isVideo(url) ? (
        <>
          <video src={url} className="size-full object-cover" muted playsInline />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
            <span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-primary shadow">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" className="size-full scale-100 object-cover transition-transform duration-300 group-hover:scale-105" />
      )}
    </button>
  )
}

export function AnnouncementMediaGrid({ urls, onMediaClick }: { urls: string[]; onMediaClick?: (index: number) => void }) {
  if (urls.length === 0) return null

  const open = (i: number) => () => onMediaClick?.(i)

  if (urls.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl">
        <MediaTile url={urls[0]} onClick={open(0)} className="max-h-[420px]" />
      </div>
    )
  }

  if (urls.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
        {urls.map((url, i) => (
          <div key={i} className="h-60">
            <MediaTile url={url} onClick={open(i)} />
          </div>
        ))}
      </div>
    )
  }

  if (urls.length === 3) {
    return (
      <div className="mt-3 grid h-80 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl">
        <div className="row-span-2">
          <MediaTile url={urls[0]} onClick={open(0)} />
        </div>
        <div>
          <MediaTile url={urls[1]} onClick={open(1)} />
        </div>
        <div>
          <MediaTile url={urls[2]} onClick={open(2)} />
        </div>
      </div>
    )
  }

  if (urls.length === 4) {
    return (
      <div className="mt-3 grid h-80 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl">
        {urls.map((url, i) => (
          <div key={i}>
            <MediaTile url={url} onClick={open(i)} />
          </div>
        ))}
      </div>
    )
  }

  const extra = urls.length - 5
  return (
    <div className="mt-3 grid h-80 grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
      <div className="h-full">
        <MediaTile url={urls[0]} onClick={open(0)} />
      </div>
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
        {urls.slice(1, 5).map((url, i) => (
          <div key={i} className="relative">
            <MediaTile url={url} onClick={open(i + 1)} />
            {i === 3 && extra > 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55">
                <span className="text-xl font-bold text-white">+{extra}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
