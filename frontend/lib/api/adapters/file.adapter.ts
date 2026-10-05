/** Converts a base64 data URL (e.g. from a canvas crop or FileReader preview)
 * into a real File for multipart upload to the backend. */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",")
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch?.[1] ?? "image/jpeg"
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}
