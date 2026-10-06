export type Purok = string

export interface Address {
  purok: Purok
  street: string
  houseNumber: string
}

export interface UploadedFile {
  id: string
  name: string
  url: string
  sizeKb: number
  mimeType: string
  uploadedAt: string
  /** Present only for large/video files that bypassed base64 encoding (see
   * FileDropzone) -- an object URL preview with the original File attached,
   * so uploaders can send it directly instead of round-tripping through a
   * base64 string (which would crash the tab for anything beyond a few MB). */
  rawFile?: File
}

export interface EvidencePhoto {
  dataUrl: string
  source: "LIVE_CAMERA" | "FILE_UPLOAD"
}

export interface TimelineEvent {
  id: string
  label: string
  description?: string
  actor?: string
  timestamp: string
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SortDirection = "asc" | "desc"
