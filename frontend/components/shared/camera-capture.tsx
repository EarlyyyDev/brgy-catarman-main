"use client"

import * as React from "react"
import { Camera, RefreshCw, ShieldCheck, VideoOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCameraErrorMessage, requestCameraStream } from "@/lib/camera"

interface CameraCaptureProps {
  value: string
  onChange: (dataUrl: string) => void
  className?: string
  helperText?: string
}

export function CameraCapture({
  value,
  onChange,
  className,
  helperText = "A live photo capture is required to verify your identity as the reporter. File uploads are not accepted for this field. Your identity remains confidential and is only visible to authorized barangay staff.",
}: CameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = React.useState(false)
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

  async function startCamera() {
    setError(null)
    try {
      const stream = await requestCameraStream("user")
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
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    onChange(canvas.toDataURL("image/jpeg", 0.9))
    stopStream()
  }

  function retake() {
    onChange("")
    void startCamera()
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-black/90">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Captured reporter photo" className="h-full w-full object-cover" />
        ) : isStreaming ? (
          <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/70">
            <VideoOff className="size-8" />
            <p className="px-6 text-center text-xs">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {error ? <p className="max-w-sm text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {!value && !isStreaming ? (
          <Button type="button" onClick={() => void startCamera()}>
            <Camera className="size-4" />
            Turn On Camera
          </Button>
        ) : null}
        {isStreaming && !value ? (
          <Button type="button" onClick={capturePhoto}>
            <Camera className="size-4" />
            Capture Photo
          </Button>
        ) : null}
        {value ? (
          <Button type="button" variant="outline" onClick={retake}>
            <RefreshCw className="size-4" />
            Retake Photo
          </Button>
        ) : null}
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
        {helperText}
      </p>
    </div>
  )
}
