"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { announcementsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { fromBackendComment, reactionToBackend, reactionFromBackend, type EngagementComment } from "@/lib/api/adapters/engagement.adapter"
import { useMe } from "@/lib/api/hooks/use-auth"
import { useViewerKey } from "@/lib/hooks/use-viewer-key"
import type { ReactionKey } from "@/components/public/reaction-icons"
import type { Announcement } from "@/types"

interface BackendAnnouncementDetail {
  reactionCounts?: Record<string, number>
  myReaction?: string | null
  comments: Parameters<typeof fromBackendComment>[0][]
}

/**
 * @param isStaffContext Pass true only when rendered inside the staff/admin
 * dashboard. The app has one shared login session with no per-portal scoping,
 * so without this flag a staff/admin merely being logged in would have their
 * identity attached to content posted through the public site. Defaults to
 * false (anonymous) so the safe behavior is the one you get by omission.
 */
export function useAnnouncementEngagement(announcement: Announcement, isStaffContext: boolean = false) {
  const viewerKey = useViewerKey(!isStaffContext)
  const { data: session } = useMe()
  const effectiveSession = isStaffContext ? session : null
  const queryClient = useQueryClient()

  const detailQuery = useQuery<BackendAnnouncementDetail>({
    queryKey: [...qk.announcements.publicDetail(announcement.id), viewerKey, isStaffContext],
    queryFn: () =>
      (isStaffContext
        ? announcementsApi.get(announcement.id, viewerKey)
        : announcementsApi.getPublic(announcement.id, viewerKey)) as Promise<BackendAnnouncementDetail>,
    enabled: Boolean(viewerKey),
  })

  const reactionCounts = detailQuery.data?.reactionCounts ?? {}
  const likeCount = Object.values(reactionCounts).reduce((a, b) => a + b, 0)
  // Only the reaction types that actually have a count > 0, ranked by count
  // -- used to render the stacked reaction-summary bubbles, which must never
  // show a type nobody actually reacted with.
  const topReactions: ReactionKey[] = React.useMemo(
    () =>
      Object.entries(reactionCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => reactionFromBackend(key))
        .filter((key): key is ReactionKey => key !== null),
    [reactionCounts],
  )
  const reaction = reactionFromBackend(detailQuery.data?.myReaction)
  const comments: EngagementComment[] = React.useMemo(
    () => (detailQuery.data?.comments ?? []).map(fromBackendComment),
    [detailQuery.data],
  )
  const totalCommentCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  const viewerName = effectiveSession?.name ?? "Resident"
  const viewerRole = effectiveSession?.role

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: qk.announcements.publicDetail(announcement.id) })
    queryClient.invalidateQueries({ queryKey: qk.announcements.detail(announcement.id) })
  }

  const setReactionMutation = useApiMutation<unknown, { reaction: string | null }>({
    mutationFn: ({ reaction: r }) =>
      isStaffContext
        ? announcementsApi.setPostReaction(announcement.id, { reaction: r })
        : announcementsApi.setPostReactionPublic(announcement.id, { reaction: r, viewerKey }),
    showErrorToast: false,
    onSuccess: invalidate,
  })

  const addCommentMutation = useApiMutation<unknown, { text: string }>({
    mutationFn: ({ text }) =>
      isStaffContext
        ? announcementsApi.addComment(announcement.id, { text })
        : announcementsApi.addCommentPublic(announcement.id, { text, authorName: viewerName, viewerKey }),
    showErrorToast: false,
    onSuccess: invalidate,
  })

  function pickReaction(key: ReactionKey) {
    setReactionMutation.mutate({ reaction: reaction === key ? null : reactionToBackend(key) })
  }

  function addComment(text: string) {
    addCommentMutation.mutate({ text })
  }

  return {
    likeCount,
    topReactions,
    reaction,
    pickReaction,
    comments,
    totalCommentCount,
    addComment,
    viewerName,
    viewerRole,
    viewerKey,
    isLoading: detailQuery.isLoading,
    invalidate,
  }
}
