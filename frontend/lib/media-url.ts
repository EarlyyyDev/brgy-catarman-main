// Announcement mediaUrls only ever carries plain URL strings (no mimeType),
// and persisted media is always a real "/uploads/..." path by the time it's
// read back for display (data: URLs only ever existed transiently in the
// browser before upload), so video vs. image is detected by file extension.
const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov|m4v|avi|mkv)(\?.*)?$/i

export function isVideoUrl(url: string): boolean {
  return url.startsWith("data:video/") || VIDEO_EXTENSION_PATTERN.test(url)
}
