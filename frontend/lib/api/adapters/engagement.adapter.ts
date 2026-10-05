import type { ReactionKey } from "@/components/public/reaction-icons"

export type CommentAuthorRole = "Staff" | "Administrator"

export interface EngagementReply {
  id: string
  name: string
  role?: CommentAuthorRole
  avatarUrl?: string
  text: string
  createdAt: string
  viewerKey?: string
  authorId?: string
}

export interface EngagementComment {
  id: string
  text: string
  authorName: string
  authorRole?: CommentAuthorRole
  authorAvatarUrl?: string
  createdAt: string
  viewerKey?: string
  authorId?: string
  replies: EngagementReply[]
  reactionCount: number
  myReaction: ReactionKey | null
}

const REACTION_TO_BACKEND: Record<ReactionKey, string> = {
  like: "LIKE",
  love: "LOVE",
  care: "CARE",
  haha: "HAHA",
  wow: "WOW",
  sad: "SAD",
  angry: "ANGRY",
}
const REACTION_FROM_BACKEND: Record<string, ReactionKey> = Object.fromEntries(
  Object.entries(REACTION_TO_BACKEND).map(([display, backend]) => [backend, display as ReactionKey]),
)

const ROLE_FROM_BACKEND: Record<string, CommentAuthorRole> = { STAFF: "Staff", ADMINISTRATOR: "Administrator" }

export function reactionToBackend(key: ReactionKey): string {
  return REACTION_TO_BACKEND[key]
}

export function reactionFromBackend(key: string | null | undefined): ReactionKey | null {
  return key ? (REACTION_FROM_BACKEND[key] ?? null) : null
}

interface BackendReply {
  id: string
  text: string
  authorName: string
  authorRole?: string | null
  author?: { avatarUrl?: string | null } | null
  createdAt: string
  viewerKey?: string | null
  authorId?: string | null
}

interface BackendComment {
  id: string
  text: string
  authorName: string
  authorRole?: string | null
  author?: { avatarUrl?: string | null } | null
  createdAt: string
  viewerKey?: string | null
  authorId?: string | null
  replies: BackendReply[]
  reactionCounts?: Record<string, number>
  myReaction?: string | null
}

export function fromBackendComment(dto: BackendComment): EngagementComment {
  return {
    id: dto.id,
    text: dto.text,
    authorName: dto.authorName,
    authorRole: dto.authorRole ? ROLE_FROM_BACKEND[dto.authorRole] : undefined,
    authorAvatarUrl: dto.author?.avatarUrl ?? undefined,
    createdAt: dto.createdAt,
    viewerKey: dto.viewerKey ?? undefined,
    authorId: dto.authorId ?? undefined,
    replies: dto.replies.map((r) => ({
      id: r.id,
      name: r.authorName,
      role: r.authorRole ? ROLE_FROM_BACKEND[r.authorRole] : undefined,
      avatarUrl: r.author?.avatarUrl ?? undefined,
      text: r.text,
      createdAt: r.createdAt,
      viewerKey: r.viewerKey ?? undefined,
      authorId: r.authorId ?? undefined,
    })),
    reactionCount: Object.values(dto.reactionCounts ?? {}).reduce((a, b) => a + b, 0),
    myReaction: reactionFromBackend(dto.myReaction),
  }
}
