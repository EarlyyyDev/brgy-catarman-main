import { body } from "express-validator";

export const announcementValidator = [
  body("title").isString().trim().notEmpty(),
  body("content").isString().trim().notEmpty(),
  body("imageUrl").optional().isString(),
  body("category").optional().isIn(["GENERAL", "HEALTH", "SAFETY", "EVENT", "ADVISORY", "JOB_OPENING"]),
  body("isPinned").optional().isBoolean().toBoolean(),
  body("status").optional().isIn(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  body("publishAt").isISO8601(),
];

export const commentValidator = [
  body("text").isString().trim().isLength({ min: 1, max: 2000 }),
  body("authorName").optional().isString().trim(),
  body("viewerKey").optional().isString(),
];

export const reactionValidator = [
  body("reaction")
    .optional({ nullable: true })
    .isIn(["LIKE", "LOVE", "CARE", "HAHA", "WOW", "SAD", "ANGRY"]),
  body("viewerKey").optional().isString(),
];
