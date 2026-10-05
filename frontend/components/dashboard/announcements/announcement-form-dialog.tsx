"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { useAddAnnouncement, useUpdateAnnouncement } from "@/lib/api/hooks/use-announcements"
import { isVideoUrl } from "@/lib/media-url"
import { ApiError } from "@/lib/api/types"
import type { Announcement, AnnouncementCategory, AnnouncementFormValues, AnnouncementStatus, UploadedFile } from "@/types"

const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip"

const CATEGORIES: AnnouncementCategory[] = ["General", "Health", "Safety", "Event", "Advisory", "Job Opening"]
const STATUSES: AnnouncementStatus[] = ["Draft", "Scheduled", "Published"]

const announcementSchema = z.object({
  title: z.string().min(4, "Please enter a title."),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  status: z.enum(STATUSES as [string, ...string[]]),
  publishAt: z.string().min(1, "Please select a publish date."),
  isPinned: z.boolean(),
})

type FormValues = z.infer<typeof announcementSchema>

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  autoOpenMedia = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement?: Announcement
  autoOpenMedia?: boolean
}) {
  const addAnnouncement = useAddAnnouncement()
  const updateAnnouncement = useUpdateAnnouncement()
  const [content, setContent] = React.useState("")
  const [media, setMedia] = React.useState<UploadedFile[]>([])
  const [attachmentFiles, setAttachmentFiles] = React.useState<UploadedFile[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      category: "General",
      status: "Published",
      publishAt: new Date().toISOString().slice(0, 10),
      isPinned: false,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        announcement
          ? {
              title: announcement.title,
              category: announcement.category,
              status: announcement.status,
              publishAt: announcement.publishAt.slice(0, 10),
              isPinned: announcement.isPinned,
            }
          : {
              title: "",
              category: "General",
              status: "Published",
              publishAt: new Date().toISOString().slice(0, 10),
              isPinned: false,
            }
      )
      setContent(announcement?.content ?? "")
      const existingMedia =
        announcement?.mediaUrls && announcement.mediaUrls.length > 0
          ? announcement.mediaUrls
          : announcement?.imageUrl
            ? [announcement.imageUrl]
            : []
      setMedia(existingMedia.map((url, i) => ({ id: `existing-${i}`, name: "media", url, sizeKb: 0, mimeType: isVideoUrl(url) ? "video/*" : "image/*", uploadedAt: "" })))
      setAttachmentFiles(
        (announcement?.attachments ?? []).map((a) => ({ id: a.id, name: a.name, url: a.url, sizeKb: a.sizeKb, mimeType: a.mimeType, uploadedAt: "" }))
      )
    }
  }, [open, announcement, form])

  async function onSubmit(values: FormValues) {
    if (!content.trim()) {
      toast.error("Please write the announcement content.")
      return
    }
    const payload: AnnouncementFormValues = {
      ...values,
      category: values.category as AnnouncementCategory,
      status: values.status as AnnouncementStatus,
      content,
    }

    try {
      if (announcement) {
        await updateAnnouncement.mutateAsync({ id: announcement.id, values: payload, media, attachments: attachmentFiles })
      } else {
        await addAnnouncement.mutateAsync({ values: payload, media, attachments: attachmentFiles })
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save announcement.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{announcement ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
          <DialogDescription>Share updates, advisories, and events with the community.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <Form {...form}>
            <form id="announcement-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Content</FormLabel>
                <RichTextEditor value={content} onChange={setContent} className="mt-2" />
              </div>

              <FileDropzone
                label="Photos & Videos (optional)"
                hint="JPG, PNG up to 5MB, or video up to 3GB each — add as many as you like"
                accept="image/*,video/*"
                multiple
                maxSizeMb={3072}
                value={media}
                onChange={setMedia}
                autoOpen={autoOpenMedia && open}
              />

              <FileDropzone
                label="Attach Files (optional)"
                hint="PDF, DOCX, XLSX, or ZIP up to 5MB each"
                accept={DOCUMENT_ACCEPT}
                multiple
                value={attachmentFiles}
                onChange={setAttachmentFiles}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publishAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer font-normal">Pin to top of landing page</FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form">
            {announcement ? "Save Changes" : "Publish Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
