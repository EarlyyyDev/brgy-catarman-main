"use client"

import * as React from "react"
import { Camera, Trash2, Upload, VideoOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCameraErrorMessage, requestCameraStream } from "@/lib/camera"
import { resizeImageFile } from "@/lib/image-resize"
import type { EvidencePhoto } from "@/types"

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
])

interface MultiCameraCaptureProps {
  value: EvidencePhoto[]
  onChange: (photos: EvidencePhoto[]) => void
  className?: string
  helperText?: string
  maxPhotos?: number
}

export function MultiCameraCapture({
  value,
  onChange,
  className,
  helperText = "Capture photos now or upload evidence photos from your gallery or files.",
  maxPhotos = 6,
}: MultiCameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isReadingFiles, setIsReadingFiles] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const stopStream = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsStreaming(false)
  }, [])

  React.useEffect(() => stopStream, [stopStream])

  // The <video> element only mounts once isStreaming flips true, so the
  // stream can't be attached inline inside startCamera() -- videoRef.current
  // is still null at that point. Attach it here once the element exists.
  React.useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      void videoRef.current.play()
    }
  }, [isStreaming])

  const atLimit = value.length >= maxPhotos || isReadingFiles

  async function startCamera() {
    setError(null)
    try {
      const stream = await requestCameraStream("environment")
      streamRef.current = stream
      setIsStreaming(true)
    } catch (err) {
      setError(getCameraErrorMessage(err))
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 360
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const next = [...value, { dataUrl: canvas.toDataURL("image/jpeg", 0.85), source: "LIVE_CAMERA" as const }]
    onChange(next)
    if (next.length >= maxPhotos) stopStream()
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    const remainingSlots = maxPhotos - value.length
    if (files.length > remainingSlots) {
      setError(`You can add up to ${maxPhotos} evidence photos. Remove a photo or select fewer files.`)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    const selectedFiles = Array.from(files)
    if (selectedFiles.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      setError("Please select a supported image file (JPEG, PNG, WebP, GIF, AVIF, HEIC, or HEIF).")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setIsReadingFiles(true)
    try {
      const photos = await Promise.all(
        selectedFiles.map(async (file) => ({
          dataUrl: await resizeImageFile(file),
          source: "FILE_UPLOAD" as const,
        })),
      )
      onChange([...value, ...photos])
    } catch {
      setError("One or more selected photos could not be read. Please try another image file.")
    } finally {
      setIsReadingFiles(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removePhoto(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-black/90">
        {isStreaming ? (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/70">
            <VideoOff className="size-8" />
            <p className="px-6 text-center text-xs">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {error ? <p className="max-w-sm text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {!isStreaming ? (
          <Button type="button" onClick={() => void startCamera()} disabled={atLimit}>
            <Camera className="size-4" />
            {value.length >= maxPhotos ? "Limit Reached" : "Turn On Camera"}
          </Button>
        ) : (
          <>
            <Button type="button" onClick={capturePhoto}>
              <Camera className="size-4" />
              Capture Photo
            </Button>
            <Button type="button" variant="outline" onClick={stopStream}>
              <VideoOff className="size-4" />
              Turn Off Camera
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
          multiple
          className="sr-only"
          onChange={(event) => void addFiles(event.target.files)}
          aria-label="Choose evidence photos from your gallery or files"
          tabIndex={-1}
        />
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={atLimit}>
          <Upload className="size-4" />
          {isReadingFiles ? "Adding Photos..." : "Add from Gallery or Files"}
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="grid max-w-sm grid-cols-3 gap-2">
          {value.map((photo, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {photo.source === "FILE_UPLOAD" ? "Uploaded" : "Camera"}
              </span>
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {helperText} {value.length}/{maxPhotos} photos added.
      </p>
    </div>
  )
}
