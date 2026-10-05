import { Request } from "express";
import { engagementRepository } from "../repositories/engagement.repository";
import { announcementRepository } from "../repositories/announcement.repository";
import { notificationRepository } from "../repositories/notification.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

function effectiveViewerKey(req: Request, bodyViewerKey?: string): string {
  if (req.user) {
    return `user:${req.user.id}`;
  }
  if (!bodyViewerKey) {
    throw ApiError.badRequest("viewerKey is required for anonymous engagement");
  }
  return bodyViewerKey;
}

/** Same identity derivation as effectiveViewerKey, but never throws — used
 * for read-only "what did I already react with" lookups where an anonymous
 * visitor who hasn't been assigned a guest id yet simply has no reactions. */
function readOnlyViewerKey(req: Request, queryViewerKey?: string): string | undefined {
  if (req.user) return `user:${req.user.id}`;
  return queryViewerKey;
}

/** Returns { [targetId]: reactionKey } for the current viewer across a post
 * and all of its comments in one query, so a detail page can render "you
 * reacted with X" without a per-item round trip. */
async function getMyReactionsForAnnouncement(announcementId: string, commentIds: string[], req: Request, queryViewerKey?: string) {
  const viewerKey = readOnlyViewerKey(req, queryViewerKey);
  if (!viewerKey) return { post: null as string | null, comments: {} as Record<string, string> };

  const [postReactions, commentReactions] = await Promise.all([
    engagementRepository.findMyReactions("POST", [announcementId], viewerKey),
    commentIds.length > 0 ? engagementRepository.findMyReactions("COMMENT", commentIds, viewerKey) : Promise.resolve([]),
  ]);

  return {
    post: postReactions[0]?.reaction ?? null,
    comments: Object.fromEntries(commentReactions.map((r) => [r.targetId, r.reaction])),
  };
}

async function listComments(announcementId: string) {
  const announcement = await announcementRepository.findById(announcementId);
  if (!announcement) {
    throw ApiError.notFound("Announcement not found");
  }
  return engagementRepository.listCommentsForAnnouncement(announcementId);
}

async function addComment(
  announcementId: string,
  text: string,
  anonymousName: string | undefined,
  bodyViewerKey: string | undefined,
  req: Request,
) {
  const announcement = await announcementRepository.findById(announcementId);
  if (!announcement) {
    throw ApiError.notFound("Announcement not found");
  }

  const comment = await engagementRepository.createComment(announcementId, {
    text,
    authorId: req.user?.id ?? null,
    authorName: req.user?.name ?? anonymousName ?? "Resident",
    authorRole: req.user?.role ?? null,
    viewerKey: req.user ? undefined : effectiveViewerKey(req, bodyViewerKey),
  });

  if (req.user) {
    await activityLogService.log({
      req,
      action: "Commented on announcement",
      module: "ANNOUNCEMENTS",
      description: announcement.title,
    });
  } else {
    // Only anonymous/public comments notify staff -- a staff member
    // commenting from the dashboard is already visible in the activity log.
    await notificationRepository.create({
      title: "New Comment",
      message: `${comment.authorName} commented on "${announcement.title}"`,
      type: "INFO",
      link: "/dashboard/announcements",
    });
  }

  return comment;
}

async function addReply(
  commentId: string,
  text: string,
  anonymousName: string | undefined,
  bodyViewerKey: string | undefined,
  req: Request,
) {
  const comment = await engagementRepository.findCommentById(commentId);
  if (!comment) {
    throw ApiError.notFound("Comment not found");
  }

  return engagementRepository.createReply(commentId, {
    text,
    authorId: req.user?.id ?? null,
    authorName: req.user?.name ?? anonymousName ?? "Resident",
    authorRole: req.user?.role ?? null,
    viewerKey: req.user ? undefined : effectiveViewerKey(req, bodyViewerKey),
  });
}

async function deleteComment(commentId: string, req: Request) {
  const comment = await engagementRepository.findCommentById(commentId);
  if (!comment) {
    throw ApiError.notFound("Comment not found");
  }
  await engagementRepository.deleteComment(commentId);
  await activityLogService.log({
    req,
    action: "Removed a comment",
    module: "ANNOUNCEMENTS",
    description: commentId,
  });
}

async function setReaction(
  targetType: "POST" | "COMMENT",
  targetId: string,
  reaction: string | null,
  bodyViewerKey: string | undefined,
  req: Request,
) {
  const viewerKey = effectiveViewerKey(req, bodyViewerKey);

  if (reaction === null) {
    await engagementRepository.removeReaction(targetType, targetId, viewerKey);
    return null;
  }

  // Only anonymous/public reactions on the post itself notify staff -- not
  // comment-level reactions (too granular) and not staff's own reactions
  // (already covered by the activity log).
  if (targetType === "POST" && !req.user) {
    const announcement = await announcementRepository.findById(targetId);
    if (announcement) {
      await notificationRepository.create({
        title: "New Reaction",
        message: `Someone reacted to "${announcement.title}"`,
        type: "INFO",
        link: "/dashboard/announcements",
      });
    }
  }

  return engagementRepository.upsertReaction({
    targetType,
    targetId,
    viewerKey,
    userId: req.user?.id ?? null,
    reaction,
  });
}

async function getReactionCounts(targetType: "POST" | "COMMENT", targetId: string) {
  const groups = await engagementRepository.countReactions(targetType, targetId);
  return groups.reduce<Record<string, number>>((acc, g) => {
    acc[g.reaction] = g._count;
    return acc;
  }, {});
}

export const engagementService = {
  listComments,
  addComment,
  addReply,
  deleteComment,
  setReaction,
  getReactionCounts,
  getMyReactionsForAnnouncement,
};
