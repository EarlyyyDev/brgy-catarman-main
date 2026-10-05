const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85

/**
 * Downscales oversized images (e.g. straight-from-camera photos) before they're
 * stored as base64 data URLs, since a single uncompressed photo can exceed the
 * browser's localStorage quota on its own. PNG/WebP are re-encoded losslessly
 * (dimensions only) to preserve transparency; everything else is re-encoded as
 * JPEG. Non-image files and already-small images pass through untouched.
 */
// Formats <img>/canvas can't reliably decode in most non-Safari browsers
// (HEIC/HEIF has no native decode support outside Apple platforms) -- these
// skip the resize attempt entirely rather than fail; the browser doesn't
// need to be able to *display* the file to read and upload its bytes.
const CANVAS_INCOMPATIBLE_TYPES = new Set(["image/gif", "image/svg+xml", "image/heic", "image/heif"])

export function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || CANVAS_INCOMPATIBLE_TYPES.has(file.type)) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        if (scale === 1) {
          resolve(reader.result as string)
          return
        }

        const preserveLossless = file.type === "image/png" || file.type === "image/webp"
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(preserveLossless ? canvas.toDataURL(file.type) : canvas.toDataURL("image/jpeg", JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
