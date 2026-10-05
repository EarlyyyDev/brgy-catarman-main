import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { announcementsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toAnnouncementPayload, fromAnnouncementDto } from "@/lib/api/adapters/announcement.adapter"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { Announcement, AnnouncementFormValues, UploadedFile } from "@/types"

export function useAnnouncements(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, status: params?.status }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.announcements.list(queryParams),
    queryFn: () => announcementsApi.list(queryParams),
  })
  // Memoized so the returned array keeps a stable reference across renders
  // that don't actually change the underlying data -- an un-memoized .map()
  // here creates a new array every render, which cascades through every
  // downstream useMemo/useEffect keyed on it (e.g. the infinite-scroll
  // hook's "reset to page 1" effect), causing a visible flicker loop
  // whenever anything else on the page re-renders, most noticeably while
  // scrolling triggers the IntersectionObserver repeatedly.
  const announcements = React.useMemo(() => (data?.items ?? []).map((a) => fromAnnouncementDto(a as never)), [data])
  return { announcements, total: data?.total ?? 0, isLoading }
}

export function useAllAnnouncements() {
  return useAnnouncements({ pageSize: 5000 })
}

export function usePublishedAnnouncements(params?: { page?: number; pageSize?: number }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.announcements.public(queryParams),
    queryFn: () => announcementsApi.listPublished(queryParams),
  })
  const announcements = React.useMemo(() => (data?.items ?? []).map((a) => fromAnnouncementDto(a as never)), [data])
  return { announcements, total: data?.total ?? 0, isLoading }
}

export function usePublicAnnouncement(id: string | undefined) {
  const { data, isLoading } = useQuery<unknown>({
    queryKey: qk.announcements.publicDetail(id ?? ""),
    queryFn: () => announcementsApi.getPublic(id!),
    enabled: Boolean(id),
  })
  const announcement = React.useMemo(() => (data ? fromAnnouncementDto(data as never) : undefined), [data])
  return { announcement, isLoading }
}

/** Uploads every not-yet-real (data: URL) file in `media`/`attachments`, then
 * PATCHes the announcement with the complete attachment list (already-real
 * URLs are kept as-is) — the upload endpoint only writes the file to disk and
 * returns its URL, the announcement's own create/update call is what
 * actually persists AnnouncementAttachment rows. */
interface FileLike {
  name: string
  url: string
  mimeType: string
  sizeKb: number
  rawFile?: File
}

async function uploadIfLocal(id: string, file: FileLike) {
  // rawFile (videos) uploads the original File directly -- never round-trip
  // a large file through a base64 string. Small images still arrive as a
  // data: URL from FileDropzone's in-browser compression step.
  if (file.rawFile) {
    return (await announcementsApi.uploadAttachment(id, file.rawFile)) as {
      name: string
      url: string
      mimeType: string
      sizeKb: number
    }
  }
  if (file.url.startsWith("data:")) {
    return (await announcementsApi.uploadAttachment(id, dataUrlToFile(file.url, file.name))) as {
      name: string
      url: string
      mimeType: string
      sizeKb: number
    }
  }
  return null
}

async function syncAttachments(id: string, media: FileLike[], attachments: FileLike[]) {
  const finalAttachments: { name: string; url: string; mimeType: string; sizeKb: number; isMedia: boolean }[] = []

  for (const file of media) {
    const uploaded = await uploadIfLocal(id, file)
    if (uploaded) {
      finalAttachments.push({ ...uploaded, isMedia: true })
    } else {
      finalAttachments.push({ name: file.name, url: file.url, mimeType: file.mimeType, sizeKb: file.sizeKb, isMedia: true })
    }
  }
  for (const file of attachments) {
    const uploaded = await uploadIfLocal(id, file)
    if (uploaded) {
      finalAttachments.push({ ...uploaded, isMedia: false })
    } else {
      finalAttachments.push({ name: file.name, url: file.url, mimeType: file.mimeType, sizeKb: file.sizeKb, isMedia: false })
    }
  }

  if (finalAttachments.length > 0 || media.length > 0 || attachments.length > 0) {
    const imageUrl = finalAttachments.find((a) => a.isMedia)?.url
    return fromAnnouncementDto((await announcementsApi.update(id, { attachments: finalAttachments, imageUrl })) as never)
  }
  return undefined
}

export function useAddAnnouncement() {
  return useApiMutation<Announcement, { values: AnnouncementFormValues; media?: UploadedFile[]; attachments?: UploadedFile[] }>({
    mutationFn: async ({ values, media, attachments }) => {
      const created = fromAnnouncementDto((await announcementsApi.create(toAnnouncementPayload(values))) as never)
      const synced = await syncAttachments(created.id, media ?? [], attachments ?? [])
      return synced ?? created
    },
    invalidates: [qk.announcements.all],
    successMessage: "Announcement published successfully.",
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useApiMutation<
    Announcement,
    { id: string; values: AnnouncementFormValues; media?: UploadedFile[]; attachments?: UploadedFile[] }
  >({
    mutationFn: async ({ id, values, media, attachments }) => {
      await announcementsApi.update(id, toAnnouncementPayload(values))
      const synced = await syncAttachments(id, media ?? [], attachments ?? [])
      return synced ?? fromAnnouncementDto((await announcementsApi.get(id)) as never)
    },
    successMessage: "Announcement updated successfully.",
    onSuccess: (announcement) => {
      queryClient.invalidateQueries({ queryKey: qk.announcements.all })
      queryClient.setQueryData(qk.announcements.detail(announcement.id), announcement)
    },
  })
}

export function useDeleteAnnouncement() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => announcementsApi.delete(id),
    invalidates: [qk.announcements.all],
    successMessage: "Announcement deleted.",
  })
}

export function useToggleAnnouncementPin() {
  return useApiMutation<Announcement, string>({
    mutationFn: async (id) => fromAnnouncementDto((await announcementsApi.togglePin(id)) as never),
    invalidates: [qk.announcements.all],
  })
}
