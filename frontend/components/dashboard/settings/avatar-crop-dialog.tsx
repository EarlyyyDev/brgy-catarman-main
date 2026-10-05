"use client"

import * as React from "react"
import { ZoomIn } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const VIEWPORT_SIZE = 320
const OUTPUT_SIZE = 480
const MIN_ZOOM = 1
const MAX_ZOOM = 3

interface Offset {
  x: number
  y: number
}

function clampOffset(offset: Offset, displayedWidth: number, displayedHeight: number): Offset {
  const maxX = Math.max(0, (displayedWidth - VIEWPORT_SIZE) / 2)
  const maxY = Math.max(0, (displayedHeight - VIEWPORT_SIZE) / 2)
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  }
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
  title = "Edit Profile Photo",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  onConfirm: (dataUrl: string) => void
  title?: string
}) {
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = React.useState({ width: 0, height: 0 })
  const [zoom, setZoom] = React.useState(MIN_ZOOM)
  const [offset, setOffset] = React.useState<Offset>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const dragState = React.useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null)

  React.useEffect(() => {
    if (open) {
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
      setNaturalSize({ width: 0, height: 0 })
    }
  }, [open, imageSrc])

  const baseScale = naturalSize.width > 0 && naturalSize.height > 0 ? Math.max(VIEWPORT_SIZE / naturalSize.width, VIEWPORT_SIZE / naturalSize.height) : 0
  const scale = baseScale * zoom
  const displayedWidth = naturalSize.width * scale
  const displayedHeight = naturalSize.height * scale

  function handleImageLoad() {
    const img = imgRef.current
    if (!img) return
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
  }

  function updateZoom(next: number) {
    setZoom(next)
    setOffset((prev) => clampOffset(prev, naturalSize.width * baseScale * next, naturalSize.height * baseScale * next))
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startX: e.clientX, startY: e.clientY, startOffset: offset }
    setIsDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    setOffset(clampOffset({ x: dragState.current.startOffset.x + dx, y: dragState.current.startOffset.y + dy }, displayedWidth, displayedHeight))
  }

  function handlePointerUp() {
    dragState.current = null
    setIsDragging(false)
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault()
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - e.deltaY * 0.001))
    updateZoom(next)
  }

  function handleConfirm() {
    const img = imgRef.current
    if (!img || naturalSize.width === 0) return

    const imageLeft = VIEWPORT_SIZE / 2 + offset.x - displayedWidth / 2
    const imageTop = VIEWPORT_SIZE / 2 + offset.y - displayedHeight / 2
    const sourceX = Math.max(0, -imageLeft / scale)
    const sourceY = Math.max(0, -imageTop / scale)
    const sourceSize = VIEWPORT_SIZE / scale

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    onConfirm(canvas.toDataURL("image/jpeg", 0.92))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Drag to reposition and use the slider to zoom, then confirm.</DialogDescription>
        </DialogHeader>

        {imageSrc ? (
          <div
            className="relative mx-auto touch-none overflow-hidden rounded-lg bg-black"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, cursor: isDragging ? "grabbing" : "grab" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Photo to crop"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none select-none"
              style={{
                width: displayedWidth || undefined,
                height: displayedHeight || undefined,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
            {/* Circular crop mask: darkens everything outside the circle */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/70" />
          </div>
        ) : null}

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={([v]) => updateZoom(v)}
            disabled={!imageSrc || naturalSize.width === 0}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!imageSrc || naturalSize.width === 0}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
