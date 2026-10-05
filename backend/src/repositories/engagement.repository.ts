import { prisma } from "../config/prisma";

export const engagementRepository = {
  listCommentsForAnnouncement(announcementId: string) {
    return prisma.comment.findMany({
      where: { announcementId },
      include: {
        author: { select: { avatarUrl: true } },
        replies: { orderBy: { createdAt: "asc" }, include: { author: { select: { avatarUrl: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  createComment(
    announcementId: string,
    data: { text: string; authorId?: string | null; authorName: string; authorRole?: "STAFF" | "ADMINISTRATOR" | null; viewerKey?: string },
  ) {
    return prisma.comment.create({ data: { announcementId, ...data } });
  },

  findCommentById(id: string) {
    return prisma.comment.findUnique({ where: { id } });
  },

  createReply(
    commentId: string,
    data: { text: string; authorId?: string | null; authorName: string; authorRole?: "STAFF" | "ADMINISTRATOR" | null; viewerKey?: string },
  ) {
    return prisma.commentReply.create({ data: { commentId, ...data } });
  },

  deleteComment(id: string) {
    return prisma.comment.delete({ where: { id } });
  },

  deleteReply(id: string) {
    return prisma.commentReply.delete({ where: { id } });
  },

  /**
   * One reaction per (target, viewer) pair. `viewerKey` is the uniqueness
   * key for both anonymous visitors (a client-generated id) and logged-in
   * staff (synthesized by the service as `user:<id>`) so the same unique
   * constraint correctly prevents duplicate reactions either way.
   */
  upsertReaction(params: {
    targetType: "POST" | "COMMENT";
    targetId: string;
    viewerKey: string;
    userId?: string | null;
    reaction: string;
  }) {
    return prisma.reaction.upsert({
      where: {
        targetType_targetId_viewerKey: {
          targetType: params.targetType,
          targetId: params.targetId,
          viewerKey: params.viewerKey,
        },
      },
      create: {
        targetType: params.targetType,
        targetId: params.targetId,
        viewerKey: params.viewerKey,
        userId: params.userId,
        reaction: params.reaction as never,
      },
      update: { reaction: params.reaction as never },
    });
  },

  removeReaction(targetType: "POST" | "COMMENT", targetId: string, viewerKey: string) {
    return prisma.reaction.deleteMany({ where: { targetType, targetId, viewerKey } });
  },

  countReactions(targetType: "POST" | "COMMENT", targetId: string) {
    return prisma.reaction.groupBy({
      by: ["reaction"],
      where: { targetType, targetId },
      _count: true,
    });
  },

  /** The current viewer's own reaction(s) for a batch of targets (e.g. a
   * post plus every one of its comments) in a single query, so the response
   * can tell the frontend "you already reacted with X" without it having to
   * remember that client-side. */
  findMyReactions(targetType: "POST" | "COMMENT", targetIds: string[], viewerKey: string) {
    return prisma.reaction.findMany({
      where: { targetType, targetId: { in: targetIds }, viewerKey },
      select: { targetId: true, reaction: true },
    });
  },
};
