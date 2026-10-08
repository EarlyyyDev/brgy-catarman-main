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

type BackendComment = Parameters<typeof fromBackendComment>[0]
const EMPTY_REACTION_COUNTS: Record<string, number> = {}

interface ReactionSyncState {
  desired: string | null
  confirmed: string | null
  processing: boolean
  initialized: boolean
}

function withPostReaction(detail: BackendAnnouncementDetail | undefined, nextReaction: string | null): BackendAnnouncementDetail {
  const current = detail ?? { comments: [] }
  const counts = { ...current.reactionCounts }
  const previousReaction = current.myReaction ?? null

  if (previousReaction) {
    counts[previousReaction] = Math.max(0, (counts[previousReaction] ?? 0) - 1)
    if (counts[previousReaction] === 0) delete counts[previousReaction]
  }
  if (nextReaction) counts[nextReaction] = (counts[nextReaction] ?? 0) + 1

  return { ...current, reactionCounts: counts, myReaction: nextReaction }
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
  const detailKey = [...qk.announcements.publicDetail(announcement.id), viewerKey, isStaffContext]
  const reactionSync = React.useRef<ReactionSyncState>({
    desired: null,
    confirmed: null,
    processing: false,
    initialized: false,
  })

  const detailQuery = useQuery<BackendAnnouncementDetail>({
    queryKey: detailKey,
    queryFn: () =>
      (isStaffContext
        ? announcementsApi.get(announcement.id, viewerKey)
        : announcementsApi.getPublic(announcement.id, viewerKey)) as Promise<BackendAnnouncementDetail>,
    enabled: Boolean(viewerKey),
  })

  const reactionCounts = detailQuery.data?.reactionCounts ?? EMPTY_REACTION_COUNTS
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
  React.useEffect(() => {
    if (!detailQuery.data || reactionSync.current.processing) return
    const serverReaction = detailQuery.data.myReaction ?? null
    reactionSync.current = {
      desired: serverReaction,
      confirmed: serverReaction,
      processing: false,
      initialized: true,
    }
  }, [detailQuery.data])
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

  const setReactionMutation = useApiMutation<
    unknown,
    { reaction: string | null }
  >({
    mutationFn: ({ reaction: r }) =>
      isStaffContext
        ? announcementsApi.setPostReaction(announcement.id, { reaction: r })
        : announcementsApi.setPostReactionPublic(announcement.id, { reaction: r, viewerKey }),
    showErrorToast: true,
  })

  async function flushReactionUpdates() {
    const state = reactionSync.current
    while (state.confirmed !== state.desired) {
      const target = state.desired
      try {
        await setReactionMutation.mutateAsync({ reaction: target })
        state.confirmed = target
      } catch {
        if (state.desired === target) {
          queryClient.setQueryData<BackendAnnouncementDetail>(detailKey, (current) =>
            withPostReaction(current, state.confirmed),
          )
          state.desired = state.confirmed
          state.processing = false
          invalidate()
          return
        }
      }
    }
    state.processing = false
    invalidate()
  }

  const addCommentMutation = useApiMutation<
    unknown,
    { text: string },
    { previous: BackendAnnouncementDetail | undefined }
  >({
    mutationFn: ({ text }) =>
      isStaffContext
        ? announcementsApi.addComment(announcement.id, { text })
        : announcementsApi.addCommentPublic(announcement.id, { text, authorName: viewerName, viewerKey }),
    showErrorToast: false,
    onMutate: async ({ text }) => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<BackendAnnouncementDetail>(detailKey)
      const optimisticComment: BackendComment = {
        id: `optimistic-${crypto.randomUUID()}`,
        text,
        authorName: viewerName,
        createdAt: new Date().toISOString(),
        viewerKey: isStaffContext ? undefined : viewerKey,
        authorId: effectiveSession?.id,
        replies: [],
        reactionCounts: {},
        myReaction: null,
      }
      queryClient.setQueryData<BackendAnnouncementDetail>(detailKey, (current) =>
        current ? { ...current, comments: [...(current.comments ?? []), optimisticComment] } : current,
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous)
    },
    onSettled: invalidate,
  })

  function pickReaction(key: ReactionKey) {
    const state = reactionSync.current
    const currentReaction =
      state.initialized ? state.desired : (queryClient.getQueryData<BackendAnnouncementDetail>(detailKey)?.myReaction ?? null)
    const nextReaction = currentReaction === reactionToBackend(key) ? null : reactionToBackend(key)

    if (!state.initialized) {
      state.confirmed = currentReaction
      state.initialized = true
    }
    state.desired = nextReaction
    void queryClient.cancelQueries({ queryKey: detailKey })
    queryClient.setQueryData<BackendAnnouncementDetail>(detailKey, (current) => withPostReaction(current, nextReaction))

    if (!state.processing) {
      state.processing = true
      void flushReactionUpdates()
    }
  }

  function addComment(text: string) {
    if (addCommentMutation.isPending) return
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
