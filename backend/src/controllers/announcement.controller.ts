import { Request, Response } from "express";
import { announcementService } from "../services/announcement.service";
import { engagementService } from "../services/engagement.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, category } = req.query as Record<string, string | undefined>;
  const result = await announcementService.list(req, { search, status, category });
  sendSuccess(res, result);
});

export const listPublishedAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const result = await announcementService.listPublished(req);
  sendSuccess(res, result);
});

export const getAnnouncement = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const announcement = await announcementService.getById(req.params.id);
  const comments = await engagementService.listComments(req.params.id);
  const reactionCounts = await engagementService.getReactionCounts("POST", req.params.id);
  const commentReactionCountEntries = await Promise.all(
    comments.map(async (c) => [c.id, await engagementService.getReactionCounts("COMMENT", c.id)] as const),
  );
  const commentReactionCounts = Object.fromEntries(commentReactionCountEntries);
  const queryViewerKey = typeof req.query.viewerKey === "string" ? req.query.viewerKey : undefined;
  const myReactions = await engagementService.getMyReactionsForAnnouncement(
    req.params.id,
    comments.map((c) => c.id),
    req,
    queryViewerKey,
  );
  sendSuccess(res, {
    ...announcement,
    comments: comments.map((c) => ({
      ...c,
      reactionCounts: commentReactionCounts[c.id] ?? {},
      myReaction: myReactions.comments[c.id] ?? null,
    })),
    reactionCounts,
    myReaction: myReactions.post,
  });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await announcementService.create(req.body, req);
  sendSuccess(res, announcement, 201);
});

export const updateAnnouncement = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const announcement = await announcementService.update(req.params.id, req.body, req);
  sendSuccess(res, announcement);
});

export const togglePinAnnouncement = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const announcement = await announcementService.togglePin(req.params.id, req);
  sendSuccess(res, announcement);
});

export const deleteAnnouncement = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await announcementService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const addComment = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { text, authorName, viewerKey } = req.body as { text: string; authorName?: string; viewerKey?: string };
  const comment = await engagementService.addComment(req.params.id, text, authorName, viewerKey, req);
  sendSuccess(res, comment, 201);
});

export const addReply = asyncHandler(async (req: Request<{ commentId: string }>, res: Response) => {
  const { text, authorName, viewerKey } = req.body as { text: string; authorName?: string; viewerKey?: string };
  const reply = await engagementService.addReply(req.params.commentId, text, authorName, viewerKey, req);
  sendSuccess(res, reply, 201);
});

export const deleteComment = asyncHandler(async (req: Request<{ commentId: string }>, res: Response) => {
  await engagementService.deleteComment(req.params.commentId, req);
  sendSuccess(res, { deleted: true });
});

export const setPostReaction = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { reaction, viewerKey } = req.body as { reaction: string | null; viewerKey?: string };
  const result = await engagementService.setReaction("POST", req.params.id, reaction, viewerKey, req);
  sendSuccess(res, result);
});

export const setCommentReaction = asyncHandler(async (req: Request<{ commentId: string }>, res: Response) => {
  const { reaction, viewerKey } = req.body as { reaction: string | null; viewerKey?: string };
  const result = await engagementService.setReaction("COMMENT", req.params.commentId, reaction, viewerKey, req);
  sendSuccess(res, result);
});
