import { Download, File, FileArchive, FileSpreadsheet, FileText } from "lucide-react"
import type { AnnouncementAttachment } from "@/types"

function iconFor(mimeType: string) {
  if (mimeType.includes("pdf")) return FileText
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheet
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return FileArchive
  return File
}

export function AnnouncementAttachmentList({ attachments }: { attachments: AnnouncementAttachment[] }) {
  if (attachments.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((file) => {
        const Icon = iconFor(file.mimeType)
        return (
          <a
            key={file.id}
            href={file.url}
            download={file.name}
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 transition-colors hover:bg-secondary"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{file.name}</span>
              <span className="block text-xs text-muted-foreground">{file.sizeKb} KB</span>
            </span>
            <Download className="size-4 shrink-0 text-muted-foreground" />
          </a>
        )
      })}
    </div>
  )
}
