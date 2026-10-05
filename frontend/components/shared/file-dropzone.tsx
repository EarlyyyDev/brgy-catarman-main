"use client"

import * as React from "react"
import { FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { UploadedFile } from "@/types"
import { generateId } from "@/lib/ids"
import { resizeImageFile } from "@/lib/image-resize"

interface FileDropzoneProps {
  label?: string
  hint?: string
  multiple?: boolean
  accept?: string
  maxSizeMb?: number
  value: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  className?: string
  /** When this flips to true, immediately opens the native file picker. */
  autoOpen?: boolean
}

function dataUrlMimeType(dataUrl: string, fallback: string): string {
  const match = /^data:([^;]+);/.exec(dataUrl)
  return match?.[1] ?? fallback
}

function estimateDataUrlSizeKb(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? ""
  return Math.round((base64.length * 3) / 4 / 1024)
}

export function FileDropzone({
  label = "Upload files",
  hint = "PDF, JPG or PNG up to 5MB",
  multiple = true,
  accept = "image/*,application/pdf",
  maxSizeMb = 5,
  value,
  onChange,
  className,
  autoOpen = false,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (autoOpen) inputRef.current?.click()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen])

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setError(null)
    const files = Array.from(fileList)
    // Non-video files still get base64-encoded in-browser (for image
    // compression) -- that path doesn't scale the way video's object-URL
    // path does, so it keeps a much lower ceiling regardless of maxSizeMb.
    const NON_VIDEO_CAP_MB = 25
    const oversized = files.find((f) => {
      const cap = f.type.startsWith("video/") ? maxSizeMb : Math.min(maxSizeMb, NON_VIDEO_CAP_MB)
      return f.size > cap * 1024 * 1024
    })
    if (oversized) {
      const cap = oversized.type.startsWith("video/") ? maxSizeMb : Math.min(maxSizeMb, NON_VIDEO_CAP_MB)
      setError(`"${oversized.name}" exceeds the ${cap}MB size limit.`)
      return
    }

    const uploaded: UploadedFile[] = await Promise.all(
      files.map(async (file) => {
        // Videos are never base64-encoded -- reading a large file into a
        // data: URL string (and later decoding it back with atob()) hangs
        // or crashes the tab well before reaching any server-side limit.
        // An object URL just references the file's bytes directly.
        if (file.type.startsWith("video/")) {
          return {
            id: generateId("file"),
            name: file.name,
            url: URL.createObjectURL(file),
            sizeKb: Math.round(file.size / 1024),
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            rawFile: file,
          }
        }
        const url = await resizeImageFile(file)
        return {
          id: generateId("file"),
          name: file.name,
          url,
          sizeKb: estimateDataUrlSizeKb(url),
          mimeType: dataUrlMimeType(url, file.type),
          uploadedAt: new Date().toISOString(),
        }
      })
    )

    onChange(multiple ? [...value, ...uploaded] : uploaded)
  }

  function removeFile(id: string) {
    const file = value.find((f) => f.id === id)
    if (file?.rawFile) URL.revokeObjectURL(file.url)
    onChange(value.filter((f) => f.id !== id))
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          void handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
        )}
      >
        <UploadCloud className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((file) => (
            <li key={file.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
              {file.mimeType.startsWith("image/") ? (
                <ImageIcon className="size-4 shrink-0 text-primary" />
              ) : (
                <FileText className="size-4 shrink-0 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.sizeKb} KB</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => removeFile(file.id)}>
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
