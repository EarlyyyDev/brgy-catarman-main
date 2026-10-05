export type AnnouncementStatus = "Draft" | "Scheduled" | "Published"

export type AnnouncementCategory = "General" | "Health" | "Safety" | "Event" | "Advisory" | "Job Opening"

export interface AnnouncementAttachment {
  id: string
  name: string
  url: string
  mimeType: string
  sizeKb: number
}

export interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string
  imageUrl?: string
  mediaUrls?: string[]
  attachments?: AnnouncementAttachment[]
  category: AnnouncementCategory
  isPinned: boolean
  status: AnnouncementStatus
  publishAt: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementFormValues {
  title: string
  content: string
  category: AnnouncementCategory
  isPinned: boolean
  status: AnnouncementStatus
  publishAt: string
}

export interface Activity {
  id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  imageUrl?: string
}
